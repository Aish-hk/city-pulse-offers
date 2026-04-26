// 10 hand-drawn avatars uploaded by the user.
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

export const AVATARS = [a0, a1, a2, a3, a4, a5, a6, a7, a8, a9];

export function avatarById(id: string | number): string {
  const n = typeof id === "number" ? id : Math.abs(hash(String(id)));
  return AVATARS[n % AVATARS.length];
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
