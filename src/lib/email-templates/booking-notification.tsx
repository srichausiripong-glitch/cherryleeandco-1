import { Body, Button, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  parent_name?: string;
  contact?: string;
  child_age?: string;
  preferred_day?: string;
  package_interest?: string;
  note?: string;
  submitted_at?: string;
}

function BookingNotification(props: Props) {
  return <Html lang="th" dir="ltr"><Head /><Preview>มีคำขอจองคลาสใหม่ พร้อมข้อมูลติดต่อผู้ปกครอง</Preview>
    <Body style={{ backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif", color: "#30302e" }}>
      <Container style={{ padding: "32px 24px", maxWidth: "600px" }}>
        <Text>CherryLee &amp; Co.</Text><Heading>มีคำขอจองคลาสใหม่ค่ะ</Heading>
        <Text>ผู้ปกครอง: {props.parent_name || "ไม่ระบุ"}</Text>
        <Text>เบอร์โทรหรือ LINE ID: {props.contact || "ไม่ระบุ"}</Text>
        <Text>อายุเด็ก: {props.child_age || "ไม่ระบุ"}</Text>
        <Text>วันที่สนใจ: {props.preferred_day || "ไม่ระบุ"}</Text>
        <Text>แพ็กเกจที่สนใจ: {props.package_interest || "ไม่ระบุ"}</Text>
        <Text>หมายเหตุ: {props.note || "ไม่มี"}</Text>
        <Text>เวลาที่ส่งคำขอ (ประเทศไทย): {props.submitted_at || "ไม่ระบุ"}</Text>
        <Button href="https://cherryleeandco.com/admin" style={{ backgroundColor: "#365746", color: "#ffffff", borderRadius: "6px", padding: "14px 20px" }}>ดูคำขอจองในหน้าคุณครู</Button>
      </Container>
    </Body>
  </Html>;
}

export const template = {
  component: BookingNotification,
  subject: "คำขอจองคลาสใหม่ | CherryLee & Co.",
  displayName: "แจ้งเจ้าของเมื่อมีคำขอจองคลาส",
  to: "srichausiripong@gmail.com",
  previewData: { parent_name: "ผู้ปกครองตัวอย่าง", contact: "LINE ID ตัวอย่าง", child_age: "8", preferred_day: "เสาร์", package_interest: "รายครั้ง", note: "สอบถามรายละเอียดคลาสค่ะ", submitted_at: "25 พฤศจิกายน 2569 13:00" },
} satisfies TemplateEntry;