import { CheckCircle2, ExternalLink, XCircle } from "lucide-react";

import type { CodeforcesDashboard, CodeforcesSubmission, LeetcodeDashboard } from "@/app/types";
import { formatDateTime } from "@/app/utils/helpers";
import { EmptyState } from "../ui";
import { codeforcesProblemUrl } from "../dashboard/utils";

type PlatformFilter = "all" | "leetcode" | "codeforces";

export function RecentActivity({
  codeforces,
  leetcode,
  platform = "all",
}: {
  codeforces: CodeforcesDashboard | null;
  leetcode: LeetcodeDashboard | null;
  platform?: PlatformFilter;
}) {
  const cfSolved = (codeforces?.recentSubmissions ?? [])
    .filter((submission) => platform !== "leetcode" && submission.verdict === "OK")
    .slice(0, 5);
  const lcAccepted = (leetcode?.submissions ?? [])
    .filter((submission) => platform !== "codeforces" && submission.statusDisplay === "Accepted")
    .slice(0, 5);

  if (!cfSolved.length && !lcAccepted.length) {
    return <EmptyState>No accepted submissions were returned yet.</EmptyState>;
  }

  return (
    <div className="feed">
      {cfSolved.map((submission) => (
        <FeedRow
          key={`cf-${submission.id}`}
          title={submission.problem.name ?? "Codeforces problem"}
          meta={`Codeforces · ${submission.programmingLanguage ?? "—"}`}
          timestamp={submission.creationTimeSeconds}
          href={codeforcesProblemUrl(submission)}
          status="accepted"
        />
      ))}
      {lcAccepted.map((submission) => (
        <FeedRow
          key={`lc-${submission.title}-${submission.timestamp}`}
          title={submission.title}
          meta={`LeetCode · ${submission.lang}`}
          timestamp={submission.timestamp}
          href={submission.url}
          status="accepted"
        />
      ))}
    </div>
  );
}

export function CodeforcesSubmissionList({ submissions }: { submissions: CodeforcesSubmission[] }) {
  const rows = submissions.slice(0, 8);

  if (!rows.length) {
    return <EmptyState>No recent Codeforces submissions were returned yet.</EmptyState>;
  }

  return (
    <div className="feed">
      {rows.map((submission) => {
        const accepted = submission.verdict === "OK";
        return (
          <FeedRow
            key={submission.id}
            title={submission.problem.name ?? "Codeforces problem"}
            meta={`${submission.verdict ?? "Pending"} · ${submission.programmingLanguage ?? "—"}`}
            timestamp={submission.creationTimeSeconds}
            href={codeforcesProblemUrl(submission)}
            status={accepted ? "accepted" : "failed"}
          />
        );
      })}
    </div>
  );
}

function FeedRow({
  title,
  meta,
  timestamp,
  href,
  status,
}: {
  title: string;
  meta: string;
  timestamp: number;
  href: string | null;
  status: "accepted" | "failed";
}) {
  const inner = (
    <>
      <div className={`feed-ic ${status}`}>
        {status === "accepted" ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
      </div>
      <div className="feed-body">
        <h4>{title}</h4>
        <p>{meta} · {formatDateTime(timestamp)}</p>
      </div>
      {href && <ExternalLink size={15} className="feed-go" />}
    </>
  );

  if (href) {
    return <a href={href} target="_blank" rel="noreferrer" className="feed-row">{inner}</a>;
  }

  return <div className="feed-row">{inner}</div>;
}
