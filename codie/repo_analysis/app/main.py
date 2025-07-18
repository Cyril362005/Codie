from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from tree_sitter import Node
from tree_sitter_languages import get_parser
from radon.visitors import ComplexityVisitor

# --- Pydantic Models ---
class CodePayload(BaseModel):
    language: str
    code: str

class AnalysisResponse(BaseModel):
    call_graph: dict[str, list[str]]
    complexity: dict[str, int]

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Repo Analysis Service",
    description="Parses code to generate a function call graph and measure cyclomatic complexity."
)

# --- Helper Functions ---
def find_child_node_by_type(node: Node, node_type: str):
    for child in node.children:
        if child.type == node_type:
            return child
    return None

def get_node_text(node: Node, code: str) -> str:
    return code[node.start_byte:node.end_byte]

def build_call_graph(node: Node, code: str) -> dict[str, list[str]]:
    call_graph = {}
    defined_functions = set()

    if node.type != 'module':
        return {}

    # Pass 1: Find all function definitions
    q = [node]
    while q:
        current = q.pop(0)
        if current.type == 'function_definition':
            name_node = find_child_node_by_type(current, 'identifier')
            if name_node:
                function_name = get_node_text(name_node, code)
                defined_functions.add(function_name)
                call_graph[function_name] = []
        q.extend(current.children)

    # Pass 2: Find calls inside each function
    q = [node]
    while q:
        current = q.pop(0)
        if current.type == 'function_definition':
            current_func_name_node = find_child_node_by_type(current, 'identifier')
            if not current_func_name_node:
                continue
            current_function_name = get_node_text(current_func_name_node, code)

            body_q = list(current.children)
            while body_q:
                body_node = body_q.pop(0)
                if body_node.type == 'call':
                    call_name_node = find_child_node_by_type(body_node, 'identifier')
                    if call_name_node:
                        called_function_name = get_node_text(call_name_node, code)
                        if called_function_name in defined_functions:
                            call_graph[current_function_name].append(called_function_name)
                if body_node.type != 'function_definition':
                    body_q.extend(body_node.children)
        else:
            q.extend(current.children)

    return call_graph

def calculate_cyclomatic_complexity(code: str) -> dict[str, int]:
    try:
        visitor = ComplexityVisitor.from_code(code)
        # Radon calculates complexity for classes as well, so we filter for functions
        return {block.name: block.complexity for block in visitor.functions}
    except Exception as e:
        # Return an empty dict if complexity calculation fails for any reason
        print(f"Could not calculate complexity: {e}")
        return {}


# --- API Endpoint ---
@app.post("/api/v1/parse", response_model=AnalysisResponse)
async def parse_code_and_analyze(payload: CodePayload):
    if payload.language != "python":
        raise HTTPException(status_code=400, detail="Only 'python' is supported.")

    try:
        parser = get_parser(payload.language)
    except Exception:
        raise HTTPException(status_code=500, detail=f"Could not load parser for '{payload.language}'.")

    tree = parser.parse(bytes(payload.code, "utf8"))
    root_node = tree.root_node

    if root_node.has_error:
        raise HTTPException(status_code=400, detail="Code parsing failed.")

    call_graph = build_call_graph(root_node, payload.code)
    complexity = calculate_cyclomatic_complexity(payload.code)

    return {
        "call_graph": call_graph,
        "complexity": complexity
    }

@app.get("/")
def health_check():
    return {"message": "Repo Analysis Service is running"}