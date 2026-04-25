#!/usr/bin/env python3
"""
LoomMCP Token Counter
Measures token savings between raw file reads and TOON skeleton output.
Uses tiktoken for accurate GPT token counting.
"""

import os
import sys
import json
import time
import subprocess
import argparse
from pathlib import Path

def count_tokens_tiktoken(text: str, model: str = "cl100k_base") -> int:
    """Count tokens using tiktoken."""
    try:
        import tiktoken
        enc = tiktoken.encoding_for_model(model) if model in ["gpt-4", "gpt-3.5-turbo"] else tiktoken.get_encoding(model)
        return len(enc.encode(text))
    except ImportError:
        print("Warning: tiktoken not installed. Falling back to char/4 estimate.", file=sys.stderr)
        return len(text) // 4

def get_all_source_files(directory: str, extensions: list) -> list:
    """Recursively get all source files in directory."""
    files = []
    skip_dirs = {'node_modules', '.git', 'dist', 'build', 'target', '__pycache__', '.venv', 'venv'}
    
    for root, dirs, filenames in os.walk(directory):
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        for filename in filenames:
            ext = filename.split('.')[-1] if '.' in filename else ''
            if ext in extensions:
                files.append(os.path.join(root, filename))
    
    return files

def count_raw_tokens(directory: str, extensions: list) -> int:
    """Count tokens in raw source files."""
    total = 0
    files = get_all_source_files(directory, extensions)
    
    for filepath in files:
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                total += count_tokens_tiktoken(content)
        except Exception as e:
            print(f"Error reading {filepath}: {e}", file=sys.stderr)
    
    return total

def run_loom_topology(directory: str, loom_server_path: str) -> tuple:
    """Run loom_get_topology and measure latency."""
    request = json.dumps({
        "jsonrpc": "2.0",
        "id": "1",
        "method": "tools/call",
        "params": {
            "name": "loom_get_topology",
            "arguments": {"dir": "src" if os.path.exists(os.path.join(directory, "src")) else "."}
        }
    })
    
    start = time.time()
    try:
        result = subprocess.run(
            f'echo {json.dumps(request)} | node {loom_server_path}',
            shell=True,
            capture_output=True,
            text=True,
            cwd=directory,
            timeout=30
        )
        latency_ms = (time.time() - start) * 1000
        
        for line in result.stdout.split('\n'):
            if '"result"' in line:
                try:
                    response = json.loads(line)
                    content = response.get('result', {}).get('content', [])
                    if content:
                        return count_tokens_tiktoken(content[0].get('text', '')), latency_ms
                except json.JSONDecodeError:
                    pass
        
        return 0, latency_ms
    except subprocess.TimeoutExpired:
        return 0, -1
    except Exception as e:
        print(f"Error running Loom: {e}", file=sys.stderr)
        return 0, -1

def benchmark_directory(directory: str, loom_server_path: str, extensions: list = None) -> dict:
    """Run full benchmark on a directory."""
    if extensions is None:
        extensions = ['ts', 'tsx', 'js', 'jsx', 'py', 'rs', 'go']
    
    if not os.path.exists(directory):
        return {"error": f"Directory not found: {directory}"}
    
    raw_tokens = count_raw_tokens(directory, extensions)
    loom_tokens, latency_ms = run_loom_topology(directory, loom_server_path)
    
    reduction_pct = 0
    if raw_tokens > 0 and loom_tokens > 0:
        reduction_pct = round((1 - loom_tokens / raw_tokens) * 100, 1)
    
    file_count = len(get_all_source_files(directory, extensions))
    
    return {
        "directory": directory,
        "files": file_count,
        "raw_tokens": raw_tokens,
        "loom_tokens": loom_tokens,
        "reduction_pct": reduction_pct,
        "latency_ms": round(latency_ms, 1) if latency_ms > 0 else "timeout",
        "cost_baseline": round(raw_tokens / 1_000_000 * 15, 4),
        "cost_loom": round(loom_tokens / 1_000_000 * 15, 4)
    }

def main():
    parser = argparse.ArgumentParser(description="LoomMCP Token Benchmark Tool")
    parser.add_argument("directory", nargs="?", default=".", help="Directory to benchmark")
    parser.add_argument("--server", "-s", default="../dist/index.js", help="Path to loom server")
    parser.add_argument("--extensions", "-e", default="ts,tsx,js,jsx,py", help="File extensions to include")
    parser.add_argument("--json", "-j", action="store_true", help="Output JSON")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    extensions = args.extensions.split(',')
    
    result = benchmark_directory(args.directory, args.server, extensions)
    
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print("=" * 50)
        print("LoomMCP Token Benchmark")
        print("=" * 50)
        print(f"Directory: {result.get('directory', 'N/A')}")
        print(f"Files: {result.get('files', 0)}")
        print("-" * 50)
        print(f"Raw tokens: {result.get('raw_tokens', 0):,}")
        print(f"LOOM tokens: {result.get('loom_tokens', 0):,}")
        print(f"Reduction: {result.get('reduction_pct', 0)}%")
        print(f"Latency: {result.get('latency_ms', 'N/A')} ms")
        print("-" * 50)
        print(f"Baseline cost: ${result.get('cost_baseline', 0)}")
        print(f"LOOM cost: ${result.get('cost_loom', 0)}")
        print(f"Savings: ${round(result.get('cost_baseline', 0) - result.get('cost_loom', 0), 4)}")
        print("=" * 50)
        
        if result.get('reduction_pct', 0) >= 75:
            print("PASS: >75% token reduction achieved!")
        elif result.get('reduction_pct', 0) >= 50:
            print("GOOD: >50% token reduction achieved")
        else:
            print("NEEDS WORK: <50% token reduction")

if __name__ == "__main__":
    main()