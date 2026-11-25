import { Suspense, useState } from "react";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, ChevronRight, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bookingCopy as c, bookingStatusLabels } from "@/content/admin/bookings";
import { bookingPageSize, bookingStatusSchema, bookingStatuses, type BookingRequest, type BookingStatus } from "@/lib/bookings";
import { listBookingRequests, updateBookingStatus } from "@/lib/bookings.functions";

function makeBookingsQuery(page: number, status: BookingStatus | "all") {
  return queryOptions({ queryKey: ["admin-booking-requests", page, status], queryFn: () => listBookingRequests({ data: { page, status } }) });
}

function BookingItem({ request }: { request: BookingRequest }) {
  const queryClient = useQueryClient();
  const saveStatus = useServerFn(updateBookingStatus);
  const parsed = bookingStatusSchema.safeParse(request.status);
  const currentStatus = parsed.success ? parsed.data : "new";
  const [status, setStatus] = useState<BookingStatus>(currentStatus);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ error: boolean; text: string } | null>(null);
  async function save() {
    setPending(true);
    setFeedback(null);
    try {
      const result = await saveStatus({ data: { id: request.id, status, previousStatus: currentStatus } });
      if (!result.ok) { setFeedback({ error: true, text: result.error }); return; }
      queryClient.setQueriesData<Awaited<ReturnType<typeof listBookingRequests>>>({ queryKey: ["admin-booking-requests"] }, (data) =>
        data ? { ...data, requests: data.requests.map((r) => r.id === request.id ? { ...r, status } : r) } : data);
      await queryClient.invalidateQueries({ queryKey: ["admin-booking-requests"] });
      setFeedback({ error: false, text: c.saved });
    } catch { setFeedback({ error: true, text: c.failed }); }
    finally { setPending(false); }
  }
  return (
    <li className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="break-words font-display text-xl font-bold">{request.parent_name}</h3>
        <div className="text-sm text-muted-foreground"><span>{c.received}: </span><time dateTime={request.created_at}>{new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" }).format(new Date(request.created_at))}</time></div>
      </div>
      <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        {[[c.contact, request.contact], [c.age, request.child_age], [c.day, request.preferred_day], [c.package, request.package_interest]].map(([label, value]) => (
          <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 break-words font-medium">{value || "—"}</dd></div>
        ))}
      </dl>
      {request.note ? <div className="mt-4 text-sm"><p className="text-muted-foreground">{c.note}</p><p className="mt-1 whitespace-pre-wrap break-words">{request.note}</p></div> : null}
      <div className="mt-5 flex flex-wrap items-end gap-3 border-t border-border pt-4">
        <div className="w-full sm:w-52">
          <label htmlFor={`status-${request.id}`} className="mb-2 block text-sm font-medium">{c.status}</label>
          <Select value={status} disabled={pending} onValueChange={(value) => { const parsedStatus = bookingStatusSchema.safeParse(value); if (parsedStatus.success) { setStatus(parsedStatus.data); setFeedback(null); } }}>
            <SelectTrigger id={`status-${request.id}`} aria-label={`${c.status} ${request.parent_name}`} className="min-h-11"><SelectValue /></SelectTrigger>
            <SelectContent>{bookingStatuses.map((s) => <SelectItem key={s} value={s}>{bookingStatusLabels[s]}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button className="min-h-11" disabled={pending || status === currentStatus} onClick={() => void save()}><Save aria-hidden="true" />{pending ? c.saving : c.save}</Button>
        {feedback ? <p role={feedback.error ? "alert" : "status"} className={feedback.error ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>{feedback.text}</p> : null}
      </div>
    </li>
  );
}

function BookingList({ page, status, setPage }: { page: number; status: BookingStatus | "all"; setPage: (page: number) => void }) {
  const { data } = useSuspenseQuery(makeBookingsQuery(page, status));
  const totalPages = Math.max(1, Math.ceil(data.total / bookingPageSize));
  return <>
    <p className="text-sm text-muted-foreground">{c.title} {data.total.toLocaleString("th-TH")} รายการ</p>
    {data.requests.length ? <ul role="list" className="space-y-4">{data.requests.map((request) => <BookingItem key={request.id} request={request} />)}</ul> : <p role="status" className="border-y border-border py-12 text-center text-muted-foreground">{c.empty}</p>}
    <nav aria-label="หน้ารายการคำขอจอง" className="flex items-center justify-end gap-3">
      <Button variant="outline" size="icon" className="h-11 w-11" title={c.previous} aria-label={c.previous} disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft /></Button>
      <span className="text-sm">{page + 1} / {totalPages}</span>
      <Button variant="outline" size="icon" className="h-11 w-11" title={c.next} aria-label={c.next} disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight /></Button>
    </nav>
  </>;
}

export function BookingRequests() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  return <section className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h2 className="font-display text-2xl font-bold">{c.title}</h2>
      <div className="flex flex-wrap items-center gap-3">
        <Select value={status} onValueChange={(value) => { const parsed = bookingStatusSchema.safeParse(value); setStatus(parsed.success ? parsed.data : "all"); setPage(0); }}>
          <SelectTrigger aria-label={c.filter} className="min-h-11 w-44"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">{c.all}</SelectItem>{bookingStatuses.map((s) => <SelectItem key={s} value={s}>{bookingStatusLabels[s]}</SelectItem>)}</SelectContent>
        </Select>
        <Button variant="outline" size="icon" className="h-11 w-11" title={c.refresh} aria-label={c.refresh} onClick={() => void queryClient.invalidateQueries({ queryKey: ["admin-booking-requests"] })}><RefreshCw /></Button>
      </div>
    </div>
    <Suspense fallback={<p role="status">{c.loading}</p>}><BookingList page={page} status={status} setPage={setPage} /></Suspense>
  </section>;
}