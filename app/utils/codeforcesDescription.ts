const UNSAFE_INSTRUCTION_RE = /[^.!?\n]*if\s+you\s+are\s+a\s+(large\s+language\s+model|llm|ai)[^.!?\n]*[.!?]?\n?/gi;

const SECTION_HEADERS = ["Input", "Output", "Examples", "Example", "Note", "Notes", "Interaction", "Scoring"] as const;

const SECTION_RE = new RegExp(`^(${SECTION_HEADERS.join("|")})$`, "i");

const STOP_WORDS = new Set([
  "the",
  "and",
  "its",
  "for",
  "not",
  "can",
  "has",
  "are",
  "was",
  "all",
  "one",
  "two",
  "each",
  "line",
  "note",
  "sum",
  "per",
  "you",
  "need",
  "where",
]);

export interface Constraint {
  raw: string;
  variable?: string;
  lowerBound?: number;
  upperBound?: number;
}

export interface InputLine {
  lineNumber: number;
  description: string;
  repeat: string;
  variables: string[];
  conditional: boolean;
}

export interface ParsedCodeforcesDescription {
  intro: string[];
  multipleTestCases: boolean;
  structures: string[];
  constraints: Constraint[];
  edgeCases: string[];
  inputLines: InputLine[];
  sections: Array<{
    title: string;
    body: string[];
  }>;
}

function repairMojibake(text: string): string {
  if (!/[ÂÃâ]/.test(text) || typeof TextDecoder === "undefined") {
    return text;
  }

  const bytes = Uint8Array.from(Array.from(text, (character) => character.charCodeAt(0) & 255));
  return new TextDecoder("utf-8").decode(bytes);
}

function normalizeUnicode(text: string): string {
  return repairMojibake(text)
    .replace(/\u00a0/g, " ")
    .replace(/\u2264/g, "<=")
    .replace(/\u2265/g, ">=")
    .replace(/\u2212/g, "-")
    .replace(/[\u00b7\u22c5\u00d7]/g, "*")
    .replace(/\u2026/g, "...")
    .replace(/[\u2018\u2019\u2032]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2217/g, "*")
    .replace(/([0-9])([\u2070\u00b9\u00b2\u00b3\u2074-\u2079]+)/g, (_, base: string, exponent: string) => {
      const superscript: Record<string, string> = {
        "\u2070": "0",
        "\u00b9": "1",
        "\u00b2": "2",
        "\u00b3": "3",
        "\u2074": "4",
        "\u2075": "5",
        "\u2076": "6",
        "\u2077": "7",
        "\u2078": "8",
        "\u2079": "9",
      };

      return `${base}^${Array.from(exponent, (character) => superscript[character] ?? character).join("")}`;
    });
}

function protectInlineCode(text: string): string {
  return text.replace(/\b([a-z])\s*([<>]=?)\s*([a-z0-9])/gi, "$1 $2 $3");
}

function normalizeSectionHeaders(text: string): string {
  let normalized = text;

  for (const header of SECTION_HEADERS) {
    normalized = normalized.replace(new RegExp(`(^|\\n)\\s*${header}\\s*(?=\\n|$)`, "gi"), `\n\n${header}\n`);
  }

  return normalized;
}

export function normalizeCodeforcesDescription(raw: string): string {
  return normalizeSectionHeaders(protectInlineCode(normalizeUnicode(raw).replace(/\r\n?/g, "\n")))
    .replace(UNSAFE_INSTRUCTION_RE, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseNumberExpression(expr: string): number | undefined {
  const clean = expr.replace(/\s+/g, "");

  if (!/^\d+(?:\^\d+)?(?:\*\d+(?:\^\d+)?)*$/.test(clean)) {
    return undefined;
  }

  return clean.split("*").reduce((total, part) => {
    const [base, exponent] = part.split("^").map(Number);
    return total * (Number.isFinite(exponent) ? Math.pow(base, exponent) : base);
  }, 1);
}

function extractConstraints(text: string): Constraint[] {
  const constraints: Constraint[] = [];
  const seen = new Set<string>();
  const parenthesized = /\(([^()]{1,160})\)/g;
  let match: RegExpExecArray | null;

  while ((match = parenthesized.exec(text)) !== null) {
    const raw = match[1].trim().replace(/\s+/g, " ");

    if (!/[<>=]/.test(raw) || seen.has(raw)) {
      continue;
    }

    seen.add(raw);
    const constraint: Constraint = { raw };
    const compact = raw.replace(/\s+/g, "");
    const bounds = compact.match(/^(\d+(?:\*\d+|\^\d+)*)<=?([a-zA-Z]\w*)<=?(\d+(?:\*\d+|\^\d+|-\d+)*)$/);

    if (bounds) {
      constraint.lowerBound = parseNumberExpression(bounds[1]);
      constraint.variable = bounds[2];
      constraint.upperBound = parseNumberExpression(bounds[3]);
    }

    constraints.push(constraint);
  }

  return constraints;
}

function detectStructures(text: string): string[] {
  const candidates: Array<[RegExp, string]> = [
    [/\bsegment tree\b/i, "Segment Tree"],
    [/\blinked list\b/i, "Linked List"],
    [/\btree\b/i, "Tree"],
    [/\bgraph\b/i, "Graph"],
    [/\barray\b|\bsequence\b/i, "Array"],
    [/\bstring\b/i, "String"],
    [/\bgrid\b|\bmatrix\b/i, "Grid/Matrix"],
    [/\bheap\b/i, "Heap"],
  ];

  return candidates.filter(([pattern]) => pattern.test(text)).map(([, label]) => label);
}

function detectEdgeCases(text: string): string[] {
  const flags: string[] = [];

  if (/output\s+-1|-1\s+if|return\s+-1/i.test(text)) {
    flags.push("May output -1");
  }

  if (/impossible|no\s+(such|valid|simple|path)/i.test(text)) {
    flags.push("Infeasible case exists");
  }

  if (/guaranteed/i.test(text)) {
    flags.push("Guarantees present");
  }

  if (/modulo|mod\s+\d/i.test(text)) {
    flags.push("Answer modulo N");
  }

  if (/interactiv|flush/i.test(text)) {
    flags.push("Interactive problem");
  }

  return flags;
}

function parseInputLines(inputBody: string[]): InputLine[] {
  return inputBody.map((description, index) => {
    const repeatMatch = description.match(/(?:the|each of the)\s+next\s+([a-zA-Z0-9 +\-*^]+?)\s+lines?\b/i);
    const variables = Array.from(description.matchAll(/\b([a-z][a-z0-9]{0,2})\b/g), (match) => match[1]).filter((variable) => !STOP_WORDS.has(variable));

    return {
      lineNumber: index + 1,
      description,
      repeat: repeatMatch ? repeatMatch[1].trim() : "1",
      variables: [...new Set(variables)],
      conditional: /^if\b|conditional/i.test(description.trim()),
    };
  });
}

export function parseCodeforcesDescription(raw: string): ParsedCodeforcesDescription {
  const normalized = normalizeCodeforcesDescription(raw);
  const blocks = normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const result: ParsedCodeforcesDescription = {
    intro: [],
    multipleTestCases: false,
    structures: [],
    constraints: [],
    edgeCases: [],
    inputLines: [],
    sections: [],
  };

  let activeSection: ParsedCodeforcesDescription["sections"][number] | null = null;

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const firstLine = lines[0];

    if (SECTION_RE.test(firstLine)) {
      const title = SECTION_HEADERS.find((header) => header.toLowerCase() === firstLine.toLowerCase()) ?? firstLine;
      activeSection = { title, body: lines.slice(1) };
      result.sections.push(activeSection);
      continue;
    }

    if (activeSection) {
      activeSection.body.push(...lines);
    } else {
      result.intro.push(...lines);
    }
  }

  result.multipleTestCases = /multiple test cases|number of test cases|test cases follows/i.test(normalized);
  result.structures = detectStructures(normalized);
  result.edgeCases = detectEdgeCases(normalized);
  result.constraints = extractConstraints(normalized);

  const inputSection = result.sections.find((section) => section.title.toLowerCase() === "input");
  if (inputSection) {
    result.inputLines = parseInputLines(inputSection.body);
  }

  return result;
}

export function renderParsedDescription(parsed: ParsedCodeforcesDescription): string {
  const parts: string[] = [];

  if (parsed.intro.length) {
    parts.push(parsed.intro.join("\n"));
  }

  for (const section of parsed.sections) {
    parts.push(`${section.title}\n${section.body.join("\n")}`);
  }

  return parts.join("\n\n");
}
