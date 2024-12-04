import { AbstractParser, EnclosingContext } from "../../constants";
export class PythonParser implements AbstractParser {
  findEnclosingContext(
    file: string,
    lineStart: number,
    lineEnd: number
  ): EnclosingContext {
    const lines = file.split("\n");
    let context = null;

    // Iterate backward from the start line to find the nearest enclosing context
    for (let i = lineStart - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith("def ")) {
        context = { type: "function", name: line.match(/def\s+(\w+)/)?.[1] || null };
        break;
      } else if (line.startsWith("class ")) {
        context = { type: "class", name: line.match(/class\s+(\w+)/)?.[1] || null };
        break;
      }
    }
    return null;
  }

  dryRun(file: string): { valid: boolean; error: string } {
    try {
      // Use a simple syntax validation via AST
      const { execSync } = require("child_process");
      execSync(`python -m py_compile -`, { input: file });
      return { valid: true, error: "" };
    } catch (error) {
    return { valid: false, error: "Not implemented yet" };
    }
  }
}
