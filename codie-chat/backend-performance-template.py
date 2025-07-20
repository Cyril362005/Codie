#!/usr/bin/env python3
"""
Backend Performance Baseline Template
=====================================

This file provides a template for backend performance monitoring when the Python 
backend is implemented. It includes pytest-benchmark, memory profiling, and 
security auditing configurations.

To use this template when implementing the backend:
1. Move this file to your backend directory
2. Install requirements: pip install pytest pytest-benchmark pytest-cov memory-profiler bandit safety
3. Implement your backend functions
4. Run: python backend-performance-template.py
"""

import time
import json
import psutil
import os
from memory_profiler import profile
from datetime import datetime
from typing import Dict, Any, List


class PerformanceMonitor:
    """Performance monitoring utility for backend services."""
    
    def __init__(self):
        self.metrics = []
        self.start_time = None
        
    def start_monitoring(self):
        """Start performance monitoring."""
        self.start_time = time.time()
        
    def record_metric(self, operation: str, duration: float, memory_usage: float):
        """Record a performance metric."""
        self.metrics.append({
            'operation': operation,
            'duration_ms': duration * 1000,
            'memory_mb': memory_usage,
            'timestamp': datetime.now().isoformat()
        })
        
    def get_system_metrics(self) -> Dict[str, Any]:
        """Get current system metrics."""
        return {
            'cpu_percent': psutil.cpu_percent(),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_usage': psutil.disk_usage('/').percent,
            'process_memory_mb': psutil.Process().memory_info().rss / 1024 / 1024
        }
        
    def export_metrics(self, filepath: str = 'reports/backend-performance.json'):
        """Export collected metrics to JSON file."""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'metrics': self.metrics,
            'system_info': self.get_system_metrics(),
            'summary': {
                'total_operations': len(self.metrics),
                'avg_duration_ms': sum(m['duration_ms'] for m in self.metrics) / len(self.metrics) if self.metrics else 0,
                'max_duration_ms': max((m['duration_ms'] for m in self.metrics), default=0),
                'avg_memory_mb': sum(m['memory_mb'] for m in self.metrics) / len(self.metrics) if self.metrics else 0
            }
        }
        
        with open(filepath, 'w') as f:
            json.dump(report, f, indent=2)
            
        return report


# Example functions to benchmark (replace with your actual backend functions)
@profile
def example_cpu_intensive_task():
    """Example CPU-intensive task for benchmarking."""
    result = 0
    for i in range(1000000):
        result += i ** 2
    return result


@profile  
def example_memory_intensive_task():
    """Example memory-intensive task for benchmarking."""
    large_list = [i * 2 for i in range(100000)]
    processed = [x ** 2 for x in large_list if x % 2 == 0]
    return len(processed)


def example_io_task():
    """Example I/O task for benchmarking."""
    # Simulate file I/O or network request
    time.sleep(0.01)  # Simulate 10ms I/O delay
    return "IO completed"


# Pytest benchmark tests (run with: pytest --benchmark-json=reports/benchmark-results.json)
def test_cpu_intensive_benchmark(benchmark):
    """Benchmark CPU-intensive operations."""
    result = benchmark(example_cpu_intensive_task)
    assert result > 0


def test_memory_intensive_benchmark(benchmark):
    """Benchmark memory-intensive operations."""
    result = benchmark(example_memory_intensive_task)
    assert result > 0


def test_io_benchmark(benchmark):
    """Benchmark I/O operations."""
    result = benchmark(example_io_task)
    assert result == "IO completed"


# Example API endpoint performance test (adapt for your framework - FastAPI, Flask, etc.)
class APIPerformanceTests:
    """Template for API performance testing."""
    
    @staticmethod
    def test_api_response_time():
        """Test API response time."""
        # Example for FastAPI/requests testing
        # import requests
        # start_time = time.time()
        # response = requests.get('http://localhost:8000/health')
        # duration = time.time() - start_time
        # assert response.status_code == 200
        # assert duration < 0.1  # Should respond within 100ms
        pass
    
    @staticmethod
    def test_api_under_load():
        """Test API performance under load."""
        # Example concurrent request testing
        # import concurrent.futures
        # with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        #     futures = [executor.submit(make_api_request) for _ in range(100)]
        #     results = [f.result() for f in concurrent.futures.as_completed(futures)]
        #     success_rate = sum(1 for r in results if r.status_code == 200) / len(results)
        #     assert success_rate >= 0.99  # 99% success rate
        pass


def run_performance_baseline():
    """Run the complete performance baseline."""
    monitor = PerformanceMonitor()
    monitor.start_monitoring()
    
    print("🔄 Running Backend Performance Baseline...")
    
    # Test CPU-intensive task
    start_time = time.time()
    start_memory = psutil.Process().memory_info().rss / 1024 / 1024
    
    result1 = example_cpu_intensive_task()
    
    duration = time.time() - start_time
    end_memory = psutil.Process().memory_info().rss / 1024 / 1024
    monitor.record_metric('cpu_intensive_task', duration, end_memory - start_memory)
    
    # Test memory-intensive task
    start_time = time.time()
    start_memory = psutil.Process().memory_info().rss / 1024 / 1024
    
    result2 = example_memory_intensive_task()
    
    duration = time.time() - start_time
    end_memory = psutil.Process().memory_info().rss / 1024 / 1024
    monitor.record_metric('memory_intensive_task', duration, end_memory - start_memory)
    
    # Test I/O task
    start_time = time.time()
    start_memory = psutil.Process().memory_info().rss / 1024 / 1024
    
    result3 = example_io_task()
    
    duration = time.time() - start_time
    end_memory = psutil.Process().memory_info().rss / 1024 / 1024
    monitor.record_metric('io_task', duration, end_memory - start_memory)
    
    # Export results
    report = monitor.export_metrics()
    
    print("✅ Backend Performance Baseline Complete!")
    print(f"📊 Results saved to: reports/backend-performance.json")
    print(f"📈 Average operation time: {report['summary']['avg_duration_ms']:.2f}ms")
    print(f"💾 Average memory usage: {report['summary']['avg_memory_mb']:.2f}MB")
    
    return report


if __name__ == "__main__":
    # Install required packages first:
    # pip install pytest pytest-benchmark pytest-cov memory-profiler bandit safety psutil
    
    try:
        import pytest
        import psutil
        from memory_profiler import profile
        
        # Run the performance baseline
        run_performance_baseline()
        
        print("\n🧪 To run full test suite with benchmarks:")
        print("pytest --benchmark-json=reports/benchmark-results.json --cov=. --cov-report=html:reports/coverage")
        
        print("\n🔒 To run security analysis:")
        print("bandit -r . -f json -o reports/bandit-security.json")
        print("safety check --json --output reports/safety-security.json")
        
        print("\n📊 To run memory profiling:")
        print("python -m memory_profiler backend-performance-template.py > reports/memory-profile.txt")
        
    except ImportError as e:
        print(f"❌ Missing required package: {e}")
        print("Install requirements with: pip install pytest pytest-benchmark pytest-cov memory-profiler bandit safety psutil")
