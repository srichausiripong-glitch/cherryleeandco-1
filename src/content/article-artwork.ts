// Topic-specific editorial art; fictional scenes, never documentary studio photos.
import type { ArticleRecord } from "@/lib/articles";
import cover0 from "@/assets/articles/drama-cover.webp.asset.json";
import inline0 from "@/assets/articles/drama-inline.webp.asset.json";
import cover1 from "@/assets/articles/english-cover.webp.asset.json";
import inline1 from "@/assets/articles/english-inline.webp.asset.json";
import cover2 from "@/assets/articles/cooking-cover.webp.asset.json";
import inline2 from "@/assets/articles/cooking-inline.webp.asset.json";
import cover3 from "@/assets/articles/finance-cover.webp.asset.json";
import inline3 from "@/assets/articles/finance-inline.webp.asset.json";
import cover4 from "@/assets/articles/life-skills-cover.webp.asset.json";
import inline4 from "@/assets/articles/life-skills-inline.webp.asset.json";
import cover5 from "@/assets/articles/first-class-cover.webp.asset.json";
import inline5 from "@/assets/articles/first-class-inline.webp.asset.json";
import cover6 from "@/assets/articles/drama-acting-cover.webp.asset.json";
import inline6 from "@/assets/articles/drama-acting-inline.webp.asset.json";
import cover7 from "@/assets/articles/home-confidence-cover.webp.asset.json";
import inline7 from "@/assets/articles/home-confidence-inline.webp.asset.json";
import cover8 from "@/assets/articles/packages-cover.webp.asset.json";
import inline8 from "@/assets/articles/packages-inline.webp.asset.json";
import cover9 from "@/assets/articles/neighborhood-cover.webp.asset.json";
import inline9 from "@/assets/articles/neighborhood-inline.webp.asset.json";

export interface ArticleIllustration {
  url: string;
  alt: { th: string; en: string };
  caption?: { th: string; en: string };
}
export interface ArticleArtwork { cover: ArticleIllustration; inline: ArticleIllustration }

export const articleArtwork: Record<string, ArticleArtwork> = {
  "creative-drama-for-shy-kids": {
    cover: { url: cover0.url, alt: { th: "ภาพประกอบ: เด็กเข้าร่วมวงเล่าเรื่องกับผู้ใหญ่และเพื่อนอย่างเป็นกันเอง", en: "Illustration: A child joining a welcoming storytelling circle" } },
    inline: { url: inline0.url, alt: { th: "ภาพประกอบ: เด็กและผู้ใหญ่เล่นหุ่นสัตว์กระดาษร่วมกัน", en: "Illustration: A child and adult playing with paper animal puppets" }, caption: { th: "การเล่นเล่าเรื่องเปิดพื้นที่ให้เด็กมีส่วนร่วมในแบบของตัวเอง", en: "Storytelling play makes room for each child to participate in their own way." } },
  },
  "witty-english-weekends-overview": {
    cover: { url: cover1.url, alt: { th: "ภาพประกอบ: เด็กและผู้ใหญ่พูดคุยผ่านผลไม้และหุ่นมือ", en: "Illustration: Children and adults sharing fruit and puppet play" } },
    inline: { url: inline1.url, alt: { th: "ภาพประกอบ: มือชี้บัตรภาพสัตว์ข้างผลไม้และอุปกรณ์ศิลปะ", en: "Illustration: Hands pointing to animal picture cards beside fruit and craft supplies" }, caption: { th: "บทสนทนาเกิดขึ้นได้ระหว่างการเล่นและการทำกิจกรรมร่วมกัน", en: "Conversation can grow naturally through shared play and activities." } },
  },
  "natural-english-through-cooking-and-play": {
    cover: { url: cover2.url, alt: { th: "ภาพประกอบ: เด็กทำสลัดผลไม้ร่วมกับผู้ใหญ่", en: "Illustration: Children making a fruit bowl with an adult" } },
    inline: { url: inline2.url, alt: { th: "ภาพประกอบ: เด็กและผู้ใหญ่ช่วยกันเลือกและจัดผลไม้ใส่ชาม", en: "Illustration: Children and an adult sorting fruit into bowls" }, caption: { th: "กิจกรรมใกล้ตัวชวนให้เด็กฟัง พูด และลงมือทำไปพร้อมกัน", en: "Everyday activities bring listening, speaking and doing together." } },
  },
  "financial-board-games-for-kids": {
    cover: { url: cover3.url, alt: { th: "ภาพประกอบ: เด็กและผู้ใหญ่เล่นบอร์ดเกมที่มีตัวเดินและเหรียญจำลอง", en: "Illustration: Children and an adult playing a board game with tokens and pretend coins" } },
    inline: { url: inline3.url, alt: { th: "ภาพประกอบ: มือเลือกเหรียญจำลองและโหลที่มีสัญลักษณ์การออม การแบ่งปัน และการใช้จ่าย", en: "Illustration: Hands choosing pretend coins and jars representing saving, sharing and spending" }, caption: { th: "บอร์ดเกมเป็นพื้นที่ให้ลองตัดสินใจและพูดคุยถึงเหตุผล", en: "Board games offer space to practise decisions and discuss the reasons behind them." } },
  },
  "life-skills-beyond-textbooks": {
    cover: { url: cover4.url, alt: { th: "ภาพประกอบ: เด็กช่วยกันสร้างเมืองจำลองจากกระดาษและกล่อง", en: "Illustration: Children building a cardboard town together" } },
    inline: { url: inline4.url, alt: { th: "ภาพประกอบ: มือของเด็กช่วยกันประกอบสะพานกระดาษ", en: "Illustration: Children’s hands assembling a paper bridge together" }, caption: { th: "การร่วมมือกันเริ่มจากการฟัง ลองทำ และปรับวิธีไปด้วยกัน", en: "Working together starts with listening, trying and adjusting together." } },
  },
  "preparing-for-first-weekend-class": {
    cover: { url: cover5.url, alt: { th: "ภาพประกอบ: ผู้ปกครองและเด็กได้รับการต้อนรับที่ประตูห้องกิจกรรมในภาพวาด", en: "Illustration: A parent and child welcomed at an illustrated activity-room doorway" } },
    inline: { url: inline5.url, alt: { th: "ภาพประกอบ: กระเป๋า ขวดน้ำ เสื้อผ้า และรองเท้าสำหรับวันทำกิจกรรม", en: "Illustration: A bag, water bottle, clothing and shoes for an activity day" }, caption: { th: "ค่อย ๆ เตรียมตัวและพูดคุยกับลูกก่อนพบประสบการณ์ใหม่", en: "Take time to prepare and talk with your child before a new experience." } },
  },
  "creative-drama-vs-acting-class": {
    cover: { url: cover6.url, alt: { th: "ภาพประกอบ: เด็กใช้ผ้าคลุมและหน้ากากสัตว์เล่นเรื่องราวร่วมกัน", en: "Illustration: Children using scarves and animal masks in imaginative storytelling" } },
    inline: { url: inline6.url, alt: { th: "ภาพประกอบ: หน้ากากละคร หุ่นนก และบัตรเล่าเรื่องวางหน้าม่านสีแดง", en: "Illustration: Theatre masks, a bird puppet and story cards beside red curtains" }, caption: { th: "ละครสร้างสรรค์ให้ความสำคัญกับกระบวนการเล่นและการเรียนรู้", en: "Creative drama focuses on the process of play and learning." } },
  },
  "how-parents-support-confidence-at-home": {
    cover: { url: cover7.url, alt: { th: "ภาพประกอบ: ผู้ปกครองรับฟังลูกที่กำลังเล่าถึงภาพวาดของตัวเอง", en: "Illustration: A parent listening as a child shares their drawing" } },
    inline: { url: inline7.url, alt: { th: "ภาพประกอบ: ผู้ปกครองและลูกเล่นเรื่องราวกับหุ่นกระดาษที่บ้าน", en: "Illustration: A parent and child telling stories with paper puppets at home" }, caption: { th: "ช่วงเวลาที่ได้ฟังและเล่นร่วมกันเป็นพื้นที่อบอุ่นสำหรับลูก", en: "Listening and playing together creates a warm space for a child." } },
  },
  "weekend-class-packages-and-pricing": {
    cover: { url: cover8.url, alt: { th: "ภาพประกอบ: ผู้ปกครองและลูกวางแผนกิจกรรมกับปฏิทินภาพ", en: "Illustration: A parent and child planning activities with a picture calendar" } },
    inline: { url: inline8.url, alt: { th: "ภาพประกอบ: มือวางสัญลักษณ์ละคร ผลไม้ และบอร์ดเกมบนตารางกิจกรรม", en: "Illustration: Hands arranging drama, fruit and board-game symbols on an activity plan" }, caption: { th: "เลือกกิจกรรมโดยคำนึงถึงความสนใจของลูกและจังหวะของครอบครัว", en: "Choose activities around your child’s interests and your family’s rhythm." } },
  },
  "choosing-weekend-activities-nawamin-ramintra": {
    cover: { url: cover9.url, alt: { th: "ภาพประกอบ: ผู้ปกครองและเด็กเดินผ่านย่านบ้านและต้นไม้ในภาพวาด", en: "Illustration: A parent and child walking through an illustrated leafy neighborhood" } },
    inline: { url: inline9.url, alt: { th: "ภาพประกอบ: แผนที่จำลองจากบ้านกระดาษ ต้นไม้ และเส้นทางกิจกรรม", en: "Illustration: A conceptual paper neighborhood map with houses, trees and an activity route" }, caption: { th: "กิจกรรมใกล้บ้านช่วยให้วางแผนเวลาเดินทางและเวลาครอบครัวได้ง่ายขึ้น", en: "Nearby activities can make planning travel and family time easier." } },
  },
};

export function getArticleCover(article: Pick<ArticleRecord, "slug" | "cover_image_url" | "cover_image_alt" | "title">): ArticleIllustration | null {
  const artwork = articleArtwork[article.slug];
  if (artwork) return artwork.cover;
  if (!article.cover_image_url) return null;
  const alt = article.cover_image_alt || article.title;
  return { url: article.cover_image_url, alt: { th: alt, en: alt } };
}

export const illustrationCredit = {
  th: "ภาพประกอบสร้างด้วย AI ไม่ใช่ภาพถ่ายคลาสหรือสถานที่จริง",
  en: "AI-created illustration; not a photograph of an actual class or location.",
};
