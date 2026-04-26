// 18 hand-drawn avatars sliced from the cartoon sheet.
import a0 from "@/assets/avatars/a_0.png";
import a1 from "@/assets/avatars/a_1.png";
import a2 from "@/assets/avatars/a_2.png";
import a3 from "@/assets/avatars/a_3.png";
import a4 from "@/assets/avatars/a_4.png";
import a5 from "@/assets/avatars/a_5.png";
import a6 from "@/assets/avatars/a_6.png";
import a7 from "@/assets/avatars/a_7.png";
import a8 from "@/assets/avatars/a_8.png";
import a9 from "@/assets/avatars/a_9.png";
import a10 from "@/assets/avatars/a_10.png";
import a11 from "@/assets/avatars/a_11.png";
import a12 from "@/assets/avatars/a_12.png";
import a13 from "@/assets/avatars/a_13.png";
import a14 from "@/assets/avatars/a_14.png";
import a15 from "@/assets/avatars/a_15.png";
import a16 from "@/assets/avatars/a_16.png";
import a17 from "@/assets/avatars/a_17.png";

export const AVATARS = [a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17];

export function avatarById(id: string | number): string {
  const n = typeof id === "number" ? id : Math.abs(hash(String(id)));
  return AVATARS[n % AVATARS.length];
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
