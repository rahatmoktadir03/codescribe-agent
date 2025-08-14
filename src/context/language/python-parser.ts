import { AbstractParser, EnclosingContext } from "../../constants";

interface PythonContext {
  type: "function" | "class" | "method";
  name: string;
  startLine: number;
  endLine: number;
  indentLevel: number;
}

export class PythonParser implements AbstractParser {
  findEnclosingContext(
    file: string,
    lineStart: number,
    lineEnd: number
  ): EnclosingContext {
    const lines = file.split("\n");
    const contexts: PythonContext[] = [];

    // Parse the file to find all function and class definitions
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      const indentLevel = line.length - line.trimStart().length;

      // Match class definitions
      const classMatch = trimmedLine.match(/^class\s+(\w+).*:/);
      if (classMatch) {
        const context: PythonContext = {
          type: "class",
          name: classMatch[1],
          startLine: i + 1, // 1-based line numbers
          endLine: this.findBlockEnd(lines, i, indentLevel),
          indentLevel,
        };
        contexts.push(context);
      }

      // Match function/method definitions
      const funcMatch = trimmedLine.match(/^def\s+(\w+).*:/);
      if (funcMatch) {
        const context: PythonContext = {
          type: "function",
          name: funcMatch[1],
          startLine: i + 1, // 1-based line numbers
          endLine: this.findBlockEnd(lines, i, indentLevel),
          indentLevel,
        };
        contexts.push(context);
      }
    }

    // Find the most specific (deepest nested) context that contains our lines
    let bestContext: PythonContext | null = null;
    let bestSpecificity = -1;

    for (const context of contexts) {
      if (context.startLine <= lineStart && lineEnd <= context.endLine) {
        // This context contains our target lines
        const specificity = context.indentLevel; // Deeper indentation = more specific
        if (specificity > bestSpecificity) {
          bestSpecificity = specificity;
          bestContext = context;
        }
      }
    }

    if (bestContext) {
      // Create a mock node object similar to what Babel would return
      const mockNode = {
        type:
          bestContext.type === "class"
            ? "ClassDeclaration"
            : "FunctionDeclaration",
        loc: {
          start: { line: bestContext.startLine, column: 0 },
          end: { line: bestContext.endLine, column: 0 },
        },
        name: bestContext.name,
        pythonType: bestContext.type,
      };

      return {
        enclosingContext: mockNode as any,
      };
    }

    return {
      enclosingContext: null,
    };
  }

  private findBlockEnd(
    lines: string[],
    startIndex: number,
    baseIndent: number
  ): number {
    let endLine = startIndex + 1;

    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Skip empty lines and comments
      if (trimmedLine === "" || trimmedLine.startsWith("#")) {
        endLine = i + 1;
        continue;
      }

      const lineIndent = line.length - line.trimStart().length;

      // If we find a line with same or less indentation than the definition,
      // and it's not empty, the block has ended
      if (lineIndent <= baseIndent) {
        break;
      }

      endLine = i + 1;
    }

    return endLine;
  }

  dryRun(file: string): { valid: boolean; error: string } {
    try {
      // Basic Python syntax validation using compile()
      // This is a simple approach without requiring Python runtime

      // Check for basic syntax issues
      const issues: string[] = [];
      const lines = file.split("\n");

      let indentStack: number[] = [0];
      let inMultilineString = false;
      let multilineStringChar = "";

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        // Handle multiline strings
        if (inMultilineString) {
          if (line.includes(multilineStringChar.repeat(3))) {
            inMultilineString = false;
            multilineStringChar = "";
          }
          continue;
        }

        // Check for start of multiline strings
        if (line.includes('"""') || line.includes("'''")) {
          multilineStringChar = line.includes('"""') ? '"' : "'";
          inMultilineString = true;
          continue;
        }

        const trimmedLine = line.trim();

        // Skip empty lines and comments
        if (trimmedLine === "" || trimmedLine.startsWith("#")) {
          continue;
        }

        // Check indentation consistency
        const currentIndent = line.length - line.trimStart().length;

        // Basic indentation validation
        if (line.trimStart() !== line && currentIndent % 4 !== 0) {
          // Warning for non-standard indentation (not an error)
        }

        // Check for basic syntax patterns
        if (trimmedLine.endsWith(":")) {
          // This should increase indentation level
          const expectedIndent = currentIndent + 4;
          indentStack.push(expectedIndent);
        } else if (currentIndent < indentStack[indentStack.length - 1]) {
          // Dedent - pop from stack
          while (
            indentStack.length > 1 &&
            currentIndent < indentStack[indentStack.length - 1]
          ) {
            indentStack.pop();
          }
        }

        // Check for common syntax errors
        if (
          trimmedLine.match(
            /^\s*(def|class|if|elif|else|for|while|try|except|finally|with)\s*[^:]*$/
          )
        ) {
          issues.push(`Line ${lineNum}: Missing colon after statement`);
        }

        // Check for incorrect operators
        if (trimmedLine.includes("=") && !trimmedLine.match(/[=!<>]=|==/)) {
          const beforeEquals = trimmedLine.split("=")[0].trim();
          if (beforeEquals.match(/^\s*(if|elif|while|assert)\s/)) {
            issues.push(
              `Line ${lineNum}: Use '==' for comparison, not '=' in conditional`
            );
          }
        }
      }

      if (issues.length > 0) {
        return {
          valid: false,
          error: issues.join("; "),
        };
      }

      return {
        valid: true,
        error: "",
      };
    } catch (error) {
      return {
        valid: false,
        error: `Syntax validation error: ${error.message || error}`,
      };
    }
  }
}
