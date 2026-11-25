import { useState } from "react";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getArticleAnalytics } from "@/lib/articles.functions";

function makeAnalyticsQuery(from: string, to: string) {
  return queryOptions({
    queryKey: ["admin-article-analytics", from, to],
    queryFn: () =>
      getArticleAnalytics({
        data: {
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
        },
      }),
  });
}

function daysAgoIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function ArticleAnalytics() {
  const queryClient = useQueryClient();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { data } = useSuspenseQuery(makeAnalyticsQuery(from, to));
  const { rows, totalBookings, currentMonthBookings, monthlyBookings } = data;

  const totalViews = rows.reduce((sum, r) => sum + r.views, 0);
  const totalLine = rows.reduce((sum, r) => sum + r.contact_line, 0);
  const totalPrograms = rows.reduce((sum, r) => sum + r.contact_programs, 0);
  const totalClicks = totalLine + totalPrograms;
  const overallRate = totalViews > 0 ? Math.round((totalClicks / totalViews) * 1000) / 10 : 0;

  function handleExportCsv() {
    const header = ["บทความ", "Slug", "หมวดหมู่", "ยอดเข้าชม", "คลิกทัก LINE", "คลิกสมัครคลาส", "รวมคลิก", "อัตราคลิก (%)"];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          `"${r.title.replace(/"/g, '""')}"`,
          r.slug,
          `"${r.category.replace(/"/g, '""')}"`,
          r.views,
          r.contact_line,
          r.contact_programs,
          r.total_clicks,
          r.conversion_rate,
        ].join(","),
      ),
    ];
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `article-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">สถิติบทความและการจองคลาส</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            เปรียบเทียบยอดเข้าชมบทความ การคลิกติดต่อ และจำนวนครอบครัวที่ส่งคำขอจองคลาสในแต่ละเดือนค่ะ
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="min-h-11" onClick={handleExportCsv}>
            <Download className="h-4 w-4" aria-hidden="true" /> ส่งออก CSV
          </Button>
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => void queryClient.invalidateQueries({ queryKey: ["admin-article-analytics"] })}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> รีเฟรชข้อมูล
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap gap-2">
          <Button variant={!from && !to ? "default" : "outline"} size="sm" className="min-h-10" onClick={() => { setFrom(""); setTo(""); }}>
            ทั้งหมด
          </Button>
          <Button variant="outline" size="sm" className="min-h-10" onClick={() => { setFrom(daysAgoIso(7)); setTo(daysAgoIso(0)); }}>
            7 วันล่าสุด
          </Button>
          <Button variant="outline" size="sm" className="min-h-10" onClick={() => { setFrom(daysAgoIso(30)); setTo(daysAgoIso(0)); }}>
            30 วันล่าสุด
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label className="flex items-center gap-1.5">
            <span>จาก</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="min-h-10 rounded-md border border-border bg-background px-2" />
          </label>
          <label className="flex items-center gap-1.5">
            <span>ถึง</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="min-h-10 rounded-md border border-border bg-background px-2" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">คำขอจองคลาสเดือนนี้</p>
          <p className="mt-2 font-display text-3xl font-bold">{currentMonthBookings.toLocaleString()}</p>
        </div>
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

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-display text-lg font-bold">จำนวนคำขอจองคลาสรายเดือน (รวม {totalBookings.toLocaleString()} รายการ)</h3>
        {monthlyBookings.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">ยังไม่มีคำขอจองคลาสในช่วงวันที่ที่เลือกค่ะ</p>
        ) : (
          <ul role="list" className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {monthlyBookings.map((m) => (
              <li key={m.month} className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">{m.month}</p>
                <p className="mt-1 font-display text-2xl font-bold">{m.count.toLocaleString()} ครอบครัว</p>
              </li>
            ))}
          </ul>
        )}
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