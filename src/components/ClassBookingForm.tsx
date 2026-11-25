import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitClassBookingRequest } from "@/lib/articles.functions";

export function ClassBookingForm({ sourcePath = "/" }: { sourcePath?: string }) {
  const submitFn = useServerFn(submitClassBookingRequest);
  const [parentName, setParentName] = useState("");
  const [contact, setContact] = useState("");
  const [childAge, setChildAge] = useState("");
  const [preferredDay, setPreferredDay] = useState<"เสาร์" | "อาทิตย์" | "เสาร์หรืออาทิตย์">("เสาร์");
  const [packageInterest, setPackageInterest] = useState("รายครั้ง (1,600 บาท)");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!parentName.trim() || !contact.trim()) {
      setError("กรุณากรอกชื่อผู้ปกครองและช่องทางติดต่อค่ะ");
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitFn({
        data: {
          parent_name: parentName.trim(),
          contact: contact.trim(),
          child_age: childAge.trim(),
          preferred_day: preferredDay,
          package_interest: packageInterest,
          note: note.trim(),
          source_path: sourcePath,
        },
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      window.__lovableEvents?.track?.("project.class_booking_submitted", {
        preferred_day: preferredDay,
        package_interest: packageInterest,
        source_path: sourcePath,
      });
      setSubmitted(true);
    } catch {
      setError("ส่งคำขอจองคลาสไม่สำเร็จ กรุณาลองใหม่อีกครั้งค่ะ");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div role="status" className="mx-auto mt-8 max-w-xl rounded-2xl border-2 border-ink bg-cream p-6 text-left text-ink">
        <h3 className="font-display text-xl font-bold text-cherry-deep">ได้รับคำขอจองคลาสเรียบร้อยแล้วค่ะ</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          ครูเชอร์รี่และทีม CherryLee &amp; Co. จะติดต่อกลับตามช่องทางที่คุณพ่อคุณแม่ให้ไว้โดยเร็วที่สุดค่ะ
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-xl rounded-2xl border-2 border-ink bg-cream p-6 text-left text-ink">
      <h3 className="font-display text-xl font-bold">หรือฝากข้อมูลขอจองคลาสให้ทีมงานติดต่อกลับ</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          ชื่อผู้ปกครอง *
          <input
            type="text"
            required
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder="เช่น คุณแม่เมย์"
            className="mt-1 min-h-11 w-full rounded-xl border-2 border-peach-deep bg-paper px-3 text-base"
          />
        </label>
        <label className="block text-sm font-medium">
          เบอร์โทร หรือ LINE ID *
          <input
            type="text"
            required
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="เช่น 08x-xxx-xxxx"
            className="mt-1 min-h-11 w-full rounded-xl border-2 border-peach-deep bg-paper px-3 text-base"
          />
        </label>
        <label className="block text-sm font-medium">
          อายุน้อง (ปี)
          <input
            type="text"
            value={childAge}
            onChange={(e) => setChildAge(e.target.value)}
            placeholder="เช่น 8 ขวบ"
            className="mt-1 min-h-11 w-full rounded-xl border-2 border-peach-deep bg-paper px-3 text-base"
          />
        </label>
        <label className="block text-sm font-medium">
          วันที่สะดวก
          <select
            value={preferredDay}
            onChange={(e) => setPreferredDay(e.target.value as "เสาร์" | "อาทิตย์" | "เสาร์หรืออาทิตย์")}
            className="mt-1 min-h-11 w-full rounded-xl border-2 border-peach-deep bg-paper px-3 text-base"
          >
            <option value="เสาร์">วันเสาร์ (10:00–16:00 น.)</option>
            <option value="อาทิตย์">วันอาทิตย์ (10:00–16:00 น.)</option>
            <option value="เสาร์หรืออาทิตย์">สะดวกทั้งเสาร์และอาทิตย์</option>
          </select>
        </label>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          แพ็กเกจที่สนใจ
          <select
            value={packageInterest}
            onChange={(e) => setPackageInterest(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-xl border-2 border-peach-deep bg-paper px-3 text-base"
          >
            <option value="รายครั้ง (1,600 บาท)">รายครั้ง (1,600 บาท)</option>
            <option value="แพ็กเกจ 4 ครั้ง (5,500 บาท)">แพ็กเกจ 4 ครั้ง (5,500 บาท)</option>
            <option value="แพ็กเกจ 8 ครั้ง (10,000 บาท)">แพ็กเกจ 8 ครั้ง (10,000 บาท)</option>
          </select>
        </label>
        <label className="block text-sm font-medium">
          หมายเหตุเพิ่มเติม
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="เช่น แพ้อาหาร หรือคำถามเพิ่มเติม"
            className="mt-1 min-h-11 w-full rounded-xl border-2 border-peach-deep bg-paper px-3 text-base"
          />
        </label>
      </div>
      {error ? <p role="alert" className="mt-3 text-sm font-medium text-cherry-deep">{error}</p> : null}
      <button type="submit" disabled={submitting} className="btn btn-primary btn-sm mt-4 w-full sm:w-auto">
        {submitting ? "กำลังส่งคำขอ…" : "ส่งคำขอจองคลาส"}
      </button>
    </form>
  );
}