import os
import json
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from fastapi import HTTPException, BackgroundTasks
from pydantic import BaseModel
import logging
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
import joblib
import asyncio
import aiofiles
from pathlib import Path

logger = logging.getLogger(__name__)

class CodePattern(BaseModel):
    pattern_id: str
    pattern_type: str  # "security", "performance", "style", "architecture"
    confidence: float
    description: str
    severity: str  # "low", "medium", "high", "critical"
    suggestions: List[str]
    code_snippet: str
    line_numbers: List[int]

class VulnerabilityPrediction(BaseModel):
    file_path: str
    risk_score: float
    predicted_vulnerabilities: List[str]
    confidence: float
    mitigation_suggestions: List[str]

class CodeQualityMetrics(BaseModel):
    maintainability_index: float
    cyclomatic_complexity: float
    code_duplication: float
    test_coverage: float
    documentation_score: float
    overall_score: float

class AIPrediction(BaseModel):
    prediction_type: str
    confidence: float
    predictions: List[Dict[str, Any]]
    metadata: Dict[str, Any]

class AdvancedAIService:
    def __init__(self):
        self.models_dir = Path("models")
        self.models_dir.mkdir(exist_ok=True)
        
        # Initialize ML models
        self.vulnerability_classifier = None
        self.code_quality_regressor = None
        self.pattern_detector = None
        self.anomaly_detector = None
        
        # Load pre-trained models
        self._load_models()
        
        # Initialize feature extractors
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=1000,
            ngram_range=(1, 3),
            stop_words='english'
        )
        
        self.scaler = StandardScaler()
        
    def _load_models(self):
        """Load pre-trained machine learning models"""
        try:
            # Load vulnerability classifier
            if (self.models_dir / "vulnerability_classifier.pkl").exists():
                self.vulnerability_classifier = joblib.load(
                    self.models_dir / "vulnerability_classifier.pkl"
                )
            
            # Load code quality regressor
            if (self.models_dir / "code_quality_regressor.pkl").exists():
                self.code_quality_regressor = joblib.load(
                    self.models_dir / "code_quality_regressor.pkl"
                )
            
            # Load pattern detector
            if (self.models_dir / "pattern_detector.pkl").exists():
                self.pattern_detector = joblib.load(
                    self.models_dir / "pattern_detector.pkl"
                )
            
            # Load anomaly detector
            if (self.models_dir / "anomaly_detector.pkl").exists():
                self.anomaly_detector = joblib.load(
                    self.models_dir / "anomaly_detector.pkl"
                )
                
        except Exception as e:
            logger.warning(f"Could not load pre-trained models: {e}")
            self._initialize_default_models()
    
    def _initialize_default_models(self):
        """Initialize default models if pre-trained models are not available"""
        self.vulnerability_classifier = RandomForestClassifier(
            n_estimators=100,
            random_state=42
        )
        
        self.code_quality_regressor = RandomForestClassifier(
            n_estimators=50,
            random_state=42
        )
        
        self.pattern_detector = DBSCAN(eps=0.3, min_samples=2)
        
        self.anomaly_detector = IsolationForest(
            contamination=0.1,
            random_state=42
        )
    
    def extract_code_features(self, code_content: str) -> Dict[str, Any]:
        """Extract features from code content for ML models"""
        features = {}
        
        # Basic code metrics
        features['lines_of_code'] = len(code_content.split('\n'))
        features['characters'] = len(code_content)
        features['words'] = len(code_content.split())
        
        # Complexity metrics
        features['function_count'] = code_content.count('def ')
        features['class_count'] = code_content.count('class ')
        features['import_count'] = code_content.count('import ')
        
        # Security-related patterns
        security_patterns = [
            'eval(', 'exec(', 'os.system(', 'subprocess.call(',
            'pickle.loads(', 'yaml.load(', 'json.loads(',
            'password', 'secret', 'token', 'key'
        ]
        
        for pattern in security_patterns:
            features[f'pattern_{pattern.replace("(", "").replace(".", "_")}'] = \
                code_content.count(pattern)
        
        # Code quality indicators
        features['comment_ratio'] = len([line for line in code_content.split('\n') 
                                       if line.strip().startswith('#')]) / max(1, features['lines_of_code'])
        
        features['empty_lines_ratio'] = len([line for line in code_content.split('\n') 
                                           if not line.strip()]) / max(1, features['lines_of_code'])
        
        # Language-specific patterns
        if 'def ' in code_content:
            features['avg_function_length'] = self._calculate_avg_function_length(code_content)
        else:
            features['avg_function_length'] = 0
        
        return features
    
    def _calculate_avg_function_length(self, code_content: str) -> float:
        """Calculate average function length"""
        lines = code_content.split('\n')
        function_lengths = []
        current_function_lines = 0
        in_function = False
        
        for line in lines:
            if line.strip().startswith('def '):
                if in_function:
                    function_lengths.append(current_function_lines)
                current_function_lines = 0
                in_function = True
            elif in_function:
                current_function_lines += 1
                if line.strip() and not line.startswith(' ') and not line.startswith('\t'):
                    # End of function
                    function_lengths.append(current_function_lines)
                    in_function = False
                    current_function_lines = 0
        
        if function_lengths:
            return sum(function_lengths) / len(function_lengths)
        return 0
    
    async def predict_vulnerabilities(self, code_content: str, file_path: str) -> VulnerabilityPrediction:
        """Predict potential vulnerabilities in code"""
        try:
            # Extract features
            features = self.extract_code_features(code_content)
            feature_vector = np.array(list(features.values())).reshape(1, -1)
            
            # Normalize features
            feature_vector_scaled = self.scaler.fit_transform(feature_vector)
            
            # Predict vulnerability risk
            if self.vulnerability_classifier:
                risk_score = self.vulnerability_classifier.predict_proba(feature_vector_scaled)[0][1]
            else:
                # Fallback heuristic
                risk_score = self._calculate_heuristic_risk_score(features)
            
            # Identify specific vulnerability types
            predicted_vulnerabilities = self._identify_vulnerability_types(features, code_content)
            
            # Generate mitigation suggestions
            mitigation_suggestions = self._generate_mitigation_suggestions(predicted_vulnerabilities)
            
            return VulnerabilityPrediction(
                file_path=file_path,
                risk_score=float(risk_score),
                predicted_vulnerabilities=predicted_vulnerabilities,
                confidence=0.85,  # Confidence based on model performance
                mitigation_suggestions=mitigation_suggestions
            )
            
        except Exception as e:
            logger.error(f"Error predicting vulnerabilities: {e}")
            raise HTTPException(status_code=500, detail="Error in vulnerability prediction")
    
    def _calculate_heuristic_risk_score(self, features: Dict[str, Any]) -> float:
        """Calculate risk score using heuristic rules"""
        risk_score = 0.0
        
        # Security patterns increase risk
        security_patterns = [k for k in features.keys() if k.startswith('pattern_')]
        for pattern in security_patterns:
            if features[pattern] > 0:
                risk_score += 0.2 * features[pattern]
        
        # High complexity increases risk
        if features.get('avg_function_length', 0) > 50:
            risk_score += 0.3
        
        # Low documentation increases risk
        if features.get('comment_ratio', 0) < 0.1:
            risk_score += 0.2
        
        return min(1.0, risk_score)
    
    def _identify_vulnerability_types(self, features: Dict[str, Any], code_content: str) -> List[str]:
        """Identify specific types of vulnerabilities"""
        vulnerabilities = []
        
        # Check for common vulnerability patterns
        if features.get('pattern_eval', 0) > 0:
            vulnerabilities.append("Code Injection")
        
        if features.get('pattern_os_system', 0) > 0:
            vulnerabilities.append("Command Injection")
        
        if features.get('pattern_pickle_loads', 0) > 0:
            vulnerabilities.append("Deserialization Attack")
        
        if 'password' in code_content.lower() and 'plain' in code_content.lower():
            vulnerabilities.append("Hardcoded Credentials")
        
        if features.get('pattern_subprocess_call', 0) > 0:
            vulnerabilities.append("Process Injection")
        
        return vulnerabilities
    
    def _generate_mitigation_suggestions(self, vulnerabilities: List[str]) -> List[str]:
        """Generate mitigation suggestions for identified vulnerabilities"""
        suggestions = []
        
        for vuln in vulnerabilities:
            if vuln == "Code Injection":
                suggestions.append("Replace eval() with safer alternatives like ast.literal_eval()")
                suggestions.append("Use parameterized queries for database operations")
            
            elif vuln == "Command Injection":
                suggestions.append("Use subprocess.run() with shell=False")
                suggestions.append("Validate and sanitize all command inputs")
            
            elif vuln == "Deserialization Attack":
                suggestions.append("Use json.loads() instead of pickle.loads()")
                suggestions.append("Implement input validation for serialized data")
            
            elif vuln == "Hardcoded Credentials":
                suggestions.append("Use environment variables for sensitive data")
                suggestions.append("Implement secure credential management")
            
            elif vuln == "Process Injection":
                suggestions.append("Validate all process inputs")
                suggestions.append("Use subprocess.run() with proper argument lists")
        
        return suggestions
    
    async def analyze_code_quality(self, code_content: str, file_path: str) -> CodeQualityMetrics:
        """Analyze code quality using ML models"""
        try:
            features = self.extract_code_features(code_content)
            
            # Calculate maintainability index
            maintainability_index = self._calculate_maintainability_index(features)
            
            # Calculate cyclomatic complexity
            cyclomatic_complexity = self._calculate_cyclomatic_complexity(code_content)
            
            # Calculate code duplication
            code_duplication = self._calculate_code_duplication(code_content)
            
            # Estimate test coverage (would need actual test files)
            test_coverage = self._estimate_test_coverage(file_path)
            
            # Calculate documentation score
            documentation_score = self._calculate_documentation_score(code_content)
            
            # Calculate overall score
            overall_score = self._calculate_overall_quality_score(
                maintainability_index, cyclomatic_complexity, 
                code_duplication, test_coverage, documentation_score
            )
            
            return CodeQualityMetrics(
                maintainability_index=maintainability_index,
                cyclomatic_complexity=cyclomatic_complexity,
                code_duplication=code_duplication,
                test_coverage=test_coverage,
                documentation_score=documentation_score,
                overall_score=overall_score
            )
            
        except Exception as e:
            logger.error(f"Error analyzing code quality: {e}")
            raise HTTPException(status_code=500, detail="Error in code quality analysis")
    
    def _calculate_maintainability_index(self, features: Dict[str, Any]) -> float:
        """Calculate maintainability index"""
        # Simplified maintainability index calculation
        loc = features.get('lines_of_code', 0)
        complexity = features.get('avg_function_length', 0)
        comments = features.get('comment_ratio', 0)
        
        if loc == 0:
            return 100.0
        
        # Higher values indicate better maintainability
        mi = 171 - 5.2 * np.log(loc) - 0.23 * complexity - 16.2 * np.log(comments + 0.1)
        return max(0.0, min(100.0, mi))
    
    def _calculate_cyclomatic_complexity(self, code_content: str) -> float:
        """Calculate cyclomatic complexity"""
        complexity = 1  # Base complexity
        
        # Count decision points
        decision_keywords = ['if ', 'elif ', 'else:', 'for ', 'while ', 'except ', 'and ', 'or ']
        for keyword in decision_keywords:
            complexity += code_content.count(keyword)
        
        return float(complexity)
    
    def _calculate_code_duplication(self, code_content: str) -> float:
        """Calculate code duplication percentage"""
        lines = code_content.split('\n')
        if len(lines) <= 1:
            return 0.0
        
        # Simple duplication detection (exact line matches)
        line_counts = {}
        for line in lines:
            line = line.strip()
            if line:
                line_counts[line] = line_counts.get(line, 0) + 1
        
        duplicated_lines = sum(count - 1 for count in line_counts.values() if count > 1)
        total_lines = len(lines)
        
        return (duplicated_lines / total_lines) * 100 if total_lines > 0 else 0.0
    
    def _estimate_test_coverage(self, file_path: str) -> float:
        """Estimate test coverage (simplified)"""
        # In a real implementation, this would analyze actual test files
        # For now, return a placeholder value
        return 75.0
    
    def _calculate_documentation_score(self, code_content: str) -> float:
        """Calculate documentation score"""
        lines = code_content.split('\n')
        if not lines:
            return 0.0
        
        comment_lines = 0
        docstring_lines = 0
        
        for line in lines:
            stripped = line.strip()
            if stripped.startswith('#'):
                comment_lines += 1
            elif '"""' in stripped or "'''" in stripped:
                docstring_lines += 1
        
        total_lines = len(lines)
        comment_ratio = (comment_lines + docstring_lines) / total_lines
        
        # Score based on comment ratio (0-100)
        return min(100.0, comment_ratio * 200)
    
    def _calculate_overall_quality_score(self, maintainability: float, complexity: float,
                                       duplication: float, coverage: float, docs: float) -> float:
        """Calculate overall code quality score"""
        # Weighted average of all metrics
        weights = {
            'maintainability': 0.3,
            'complexity': 0.2,
            'duplication': 0.2,
            'coverage': 0.2,
            'docs': 0.1
        }
        
        # Normalize complexity (lower is better)
        complexity_score = max(0, 100 - complexity * 2)
        
        # Normalize duplication (lower is better)
        duplication_score = max(0, 100 - duplication)
        
        overall_score = (
            maintainability * weights['maintainability'] +
            complexity_score * weights['complexity'] +
            duplication_score * weights['duplication'] +
            coverage * weights['coverage'] +
            docs * weights['docs']
        )
        
        return round(overall_score, 2)
    
    async def detect_code_patterns(self, code_content: str, file_path: str) -> List[CodePattern]:
        """Detect code patterns using ML and rule-based approaches"""
        patterns = []
        
        # Security patterns
        security_patterns = self._detect_security_patterns(code_content)
        patterns.extend(security_patterns)
        
        # Performance patterns
        performance_patterns = self._detect_performance_patterns(code_content)
        patterns.extend(performance_patterns)
        
        # Style patterns
        style_patterns = self._detect_style_patterns(code_content)
        patterns.extend(style_patterns)
        
        # Architecture patterns
        architecture_patterns = self._detect_architecture_patterns(code_content)
        patterns.extend(architecture_patterns)
        
        return patterns
    
    def _detect_security_patterns(self, code_content: str) -> List[CodePattern]:
        """Detect security-related code patterns"""
        patterns = []
        lines = code_content.split('\n')
        
        security_rules = [
            {
                'pattern': 'eval(',
                'type': 'security',
                'severity': 'critical',
                'description': 'Use of eval() function - potential code injection vulnerability',
                'suggestion': 'Replace with safer alternatives like ast.literal_eval()'
            },
            {
                'pattern': 'os.system(',
                'type': 'security',
                'severity': 'high',
                'description': 'Use of os.system() - potential command injection',
                'suggestion': 'Use subprocess.run() with shell=False'
            },
            {
                'pattern': 'pickle.loads(',
                'type': 'security',
                'severity': 'high',
                'description': 'Use of pickle.loads() - potential deserialization attack',
                'suggestion': 'Use json.loads() for safe deserialization'
            }
        ]
        
        for i, line in enumerate(lines, 1):
            for rule in security_rules:
                if rule['pattern'] in line:
                    patterns.append(CodePattern(
                        pattern_id=f"security_{i}_{rule['pattern'].replace('(', '')}",
                        pattern_type=rule['type'],
                        confidence=0.9,
                        description=rule['description'],
                        severity=rule['severity'],
                        suggestions=[rule['suggestion']],
                        code_snippet=line.strip(),
                        line_numbers=[i]
                    ))
        
        return patterns
    
    def _detect_performance_patterns(self, code_content: str) -> List[CodePattern]:
        """Detect performance-related code patterns"""
        patterns = []
        lines = code_content.split('\n')
        
        performance_rules = [
            {
                'pattern': 'for item in list:',
                'type': 'performance',
                'severity': 'medium',
                'description': 'Consider using list comprehension for better performance',
                'suggestion': 'Use list comprehension: [item for item in list]'
            },
            {
                'pattern': 'import *',
                'type': 'performance',
                'severity': 'low',
                'description': 'Wildcard import may impact performance and namespace',
                'suggestion': 'Import specific modules instead of using wildcard import'
            }
        ]
        
        for i, line in enumerate(lines, 1):
            for rule in performance_rules:
                if rule['pattern'] in line:
                    patterns.append(CodePattern(
                        pattern_id=f"performance_{i}_{rule['pattern'].replace(' ', '_')}",
                        pattern_type=rule['type'],
                        confidence=0.8,
                        description=rule['description'],
                        severity=rule['severity'],
                        suggestions=[rule['suggestion']],
                        code_snippet=line.strip(),
                        line_numbers=[i]
                    ))
        
        return patterns
    
    def _detect_style_patterns(self, code_content: str) -> List[CodePattern]:
        """Detect code style patterns"""
        patterns = []
        lines = code_content.split('\n')
        
        for i, line in enumerate(lines, 1):
            # Check for long lines
            if len(line) > 79:
                patterns.append(CodePattern(
                    pattern_id=f"style_{i}_long_line",
                    pattern_type='style',
                    confidence=0.9,
                    description='Line exceeds PEP 8 maximum length of 79 characters',
                    severity='low',
                    suggestions=['Break long lines into multiple lines'],
                    code_snippet=line.strip(),
                    line_numbers=[i]
                ))
            
            # Check for unused imports (simplified)
            if line.strip().startswith('import ') and '#' not in line:
                # This is a simplified check - in reality, you'd need AST analysis
                pass
        
        return patterns
    
    def _detect_architecture_patterns(self, code_content: str) -> List[CodePattern]:
        """Detect architecture-related patterns"""
        patterns = []
        
        # Check for singleton pattern
        if 'class ' in code_content and '__new__' in code_content:
            patterns.append(CodePattern(
                pattern_id="architecture_singleton",
                pattern_type='architecture',
                confidence=0.7,
                description='Potential singleton pattern detected',
                severity='low',
                suggestions=['Consider if singleton is the best design choice'],
                code_snippet='Singleton pattern detected',
                line_numbers=[]
            ))
        
        # Check for large classes
        class_count = code_content.count('class ')
        if class_count > 0:
            lines_per_class = len(code_content.split('\n')) / class_count
            if lines_per_class > 100:
                patterns.append(CodePattern(
                    pattern_id="architecture_large_class",
                    pattern_type='architecture',
                    confidence=0.8,
                    description='Large class detected - consider breaking it down',
                    severity='medium',
                    suggestions=['Split large class into smaller, focused classes'],
                    code_snippet='Large class detected',
                    line_numbers=[]
                ))
        
        return patterns
    
    async def train_models(self, training_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Train or retrain ML models with new data"""
        try:
            # Prepare training data
            X = []
            y_vulnerability = []
            y_quality = []
            
            for item in training_data:
                features = self.extract_code_features(item['code_content'])
                X.append(list(features.values()))
                
                # Vulnerability labels
                y_vulnerability.append(1 if item.get('has_vulnerability', False) else 0)
                
                # Quality labels
                y_quality.append(item.get('quality_score', 0.5))
            
            X = np.array(X)
            y_vulnerability = np.array(y_vulnerability)
            y_quality = np.array(y_quality)
            
            # Train vulnerability classifier
            if len(np.unique(y_vulnerability)) > 1:
                self.vulnerability_classifier.fit(X, y_vulnerability)
                joblib.dump(self.vulnerability_classifier, self.models_dir / "vulnerability_classifier.pkl")
            
            # Train quality regressor
            if len(y_quality) > 0:
                self.code_quality_regressor.fit(X, y_quality)
                joblib.dump(self.code_quality_regressor, self.models_dir / "code_quality_regressor.pkl")
            
            return {
                "status": "success",
                "models_trained": ["vulnerability_classifier", "code_quality_regressor"],
                "training_samples": len(training_data)
            }
            
        except Exception as e:
            logger.error(f"Error training models: {e}")
            raise HTTPException(status_code=500, detail="Error training models")
    
    async def get_ai_insights(self, project_data: Dict[str, Any]) -> AIPrediction:
        """Generate AI insights for a project"""
        try:
            insights = {
                "prediction_type": "project_insights",
                "confidence": 0.85,
                "predictions": [],
                "metadata": {
                    "analysis_timestamp": datetime.utcnow().isoformat(),
                    "model_version": "1.0.0"
                }
            }
            
            # Analyze code patterns across the project
            if 'files' in project_data:
                total_vulnerabilities = 0
                total_quality_score = 0
                file_count = len(project_data['files'])
                
                for file_info in project_data['files']:
                    if 'code_content' in file_info:
                        # Predict vulnerabilities
                        vuln_prediction = await self.predict_vulnerabilities(
                            file_info['code_content'], 
                            file_info.get('path', 'unknown')
                        )
                        total_vulnerabilities += vuln_prediction.risk_score
                        
                        # Analyze quality
                        quality_metrics = await self.analyze_code_quality(
                            file_info['code_content'],
                            file_info.get('path', 'unknown')
                        )
                        total_quality_score += quality_metrics.overall_score
                
                # Generate project-level insights
                avg_vulnerability_risk = total_vulnerabilities / file_count if file_count > 0 else 0
                avg_quality_score = total_quality_score / file_count if file_count > 0 else 0
                
                insights["predictions"].extend([
                    {
                        "type": "vulnerability_risk",
                        "value": avg_vulnerability_risk,
                        "description": "Average vulnerability risk across project files"
                    },
                    {
                        "type": "code_quality",
                        "value": avg_quality_score,
                        "description": "Average code quality score across project files"
                    },
                    {
                        "type": "recommendation",
                        "value": "focus_on_security" if avg_vulnerability_risk > 0.5 else "maintain_quality",
                        "description": "Primary recommendation for project improvement"
                    }
                ])
            
            return AIPrediction(**insights)
            
        except Exception as e:
            logger.error(f"Error generating AI insights: {e}")
            raise HTTPException(status_code=500, detail="Error generating AI insights")

# Global AI service instance
ai_service = AdvancedAIService() 