import { parseCodeforcesDescription } from "@/app/utils/codeforcesDescription";

export function CodeforcesDescription({ value, compact = false }: { value: string; compact?: boolean }) {
  const parsed = parseCodeforcesDescription(value);
  const intro = compact ? parsed.intro.slice(0, 2) : parsed.intro;
  const sections = compact ? parsed.sections.slice(0, 1) : parsed.sections;
  const constraints = compact ? parsed.constraints.slice(0, 3) : parsed.constraints;
  const inputLines = compact ? [] : parsed.inputLines;

  if (!intro.length && !sections.length && !constraints.length) {
    return <p className="desc-empty">No description saved.</p>;
  }

  return (
    <div className={compact ? "cf-desc compact" : "cf-desc"}>
      {!compact && (parsed.multipleTestCases || parsed.structures.length || parsed.edgeCases.length) ? (
        <div className="cf-desc-tags">
          {parsed.multipleTestCases && <span>Multiple test cases</span>}
          {parsed.structures.map((structure) => (
            <span key={structure}>{structure}</span>
          ))}
          {parsed.edgeCases.map((edgeCase) => (
            <span key={edgeCase}>{edgeCase}</span>
          ))}
        </div>
      ) : null}
      {intro.map((paragraph, index) => (
        <p key={`intro-${index}`}>{paragraph}</p>
      ))}
      {constraints.length > 0 && (
        <section>
          <h4>Constraints</h4>
          <div className="cf-constraints">
            {constraints.map((constraint) => (
              <span key={constraint.raw}>{constraint.raw}</span>
            ))}
          </div>
        </section>
      )}
      {inputLines.length > 0 && (
        <section>
          <h4>Parsed input</h4>
          <ol className="cf-input-lines">
            {inputLines.map((line) => (
              <li key={`${line.lineNumber}-${line.description}`}>
                <strong>{line.lineNumber}</strong>
                <span>{line.description}</span>
                {line.repeat !== "1" && <em>Repeats: {line.repeat}</em>}
              </li>
            ))}
          </ol>
        </section>
      )}
      {sections.map((section) => (
        <section key={section.title}>
          <h4>{section.title}</h4>
          {section.body.map((paragraph, index) => (
            <p key={`${section.title}-${index}`}>{paragraph}</p>
          ))}
        </section>
      ))}
    </div>
  );
}
