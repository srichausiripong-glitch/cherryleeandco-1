import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getArticleAnalytics } from "@/lib/articles.functions";

const analyticsQuery = queryOptions({
  queryKey: ["admin-article-analytics"],
  queryFn: () => getArticleAnalytics(),
});

export function ArticleAnalytics() {
  const queryClient = useQueryClient();
  const { data: rows } = useSuspenseQuery(analyticsQuery);

  const totalViews = rows.reduce((sum, r) => sum + r.views, 0);
  const totalLine = rows.reduce((sum, r) => sum + r.contact_line, 0);
  const totalPrograms = rows.reduce((sum, r) => sum + r.contact_programs, 0);
  const totalClicks = totalLine + totalPrograms;
  const overallRate = totalViews > 0 ? Math.round((totalClicks / totalViews) * 1000) / 10 : 0;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">สถิติบทความและการคลิกติดต่อ</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            เปรียบเทียบยอดเข้าชมบทความ การคลิกทัก LINE และการคลิกดูตารางเรียน/สมัครคลาสของแต่ละบทความค่ะ
          </p>
        </div>
        <Button
          variant="outline"
          className="min-h-11"
          onClick={() => void queryClient.invalidateQueries({ queryKey: ["admin-article-analytics"] })}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> รีเฟรชข้อมูล
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">ยอดเข้าชมบทความรวม</p>
          <p className="mt-2 font-display text-3xl font-bold">{totalViews.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">คลิกทัก LINE</p>
          <p className="mt-2 font-display text-3xl font-bold">{totalLine.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">คลิกดูตาราง/สมัครคลาส</p>
          <p className="mt-2 font-display text-3xl font-bold">{totalPrograms.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">อัตราการคลิกติดต่อรวม</p>
          <p className="mt-2 font-display text-3xl font-bold">{overallRate}%</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="px-4 py-3 font-semibold">บทความ</th>
              <th className="px-4 py-3 font-semibold">หมวดหมู่</th>
              <th className="px-4 py-3 text-right font-semibold">เข้าชม</th>
              <th className="px-4 py-3 text-right font-semibold">ทัก LINE</th>
              <th className="px-4 py-3 text-right font-semibold">สมัครคลาส</th>
              <th className="px-4 py-3 text-right font-semibold">รวมคลิก</th>
              <th className="px-4 py-3 text-right font-semibold">อัตราคลิก</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.slug} className="hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{row.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.category}</td>
                <td className="px-4 py-3 text-right tabular-nums">{row.views.toLocaleString()}</td>
                <td className="px-4 py-3 text-right tabular-nums">{row.contact_line.toLocaleString()}</td>
                <td className="px-4 py-3 text-right tabular-nums">{row.contact_programs.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">{row.total_clicks.toLocaleString()}</td>
                <td className="px-4 py-3 text-right tabular-nums">{row.conversion_rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}