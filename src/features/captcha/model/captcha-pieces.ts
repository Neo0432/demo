import type { CaptchaPiece } from "@features/captcha/ui/captcha-puzzle";

const scene = `
  <rect width="360" height="360" fill="#eff8fb"/>
  <circle cx="278" cy="82" r="42" fill="#f3c348"/>
  <circle cx="278" cy="82" r="58" fill="#f3c348" opacity="0.18"/>
  <path d="M0 236 C46 210 82 218 124 202 C184 178 238 188 360 150 L360 360 L0 360 Z" fill="#94d2bd"/>
  <path d="M0 360 L0 242 L88 152 L174 248 L232 190 L360 314 L360 360 Z" fill="#2d6a7a"/>
  <path d="M88 152 L124 192 L94 184 L66 196 Z" fill="#f8fafc"/>
  <path d="M232 190 L266 226 L235 216 L210 228 Z" fill="#f8fafc"/>
  <path d="M0 278 C54 248 90 288 142 258 C196 226 238 292 292 260 C320 244 344 244 360 250" fill="none" stroke="#e76f51" stroke-width="16" stroke-linecap="round"/>
  <path d="M0 298 C54 268 90 308 142 278 C196 246 238 312 292 280 C320 264 344 264 360 270" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
  <circle cx="72" cy="76" r="12" fill="#0f766e"/>
  <circle cx="114" cy="58" r="8" fill="#0f766e"/>
  <circle cx="316" cy="184" r="10" fill="#0f766e"/>
`;

function createPiece(id: string, viewBox: string, correctSlot: CaptchaPiece["correctSlot"]) {
  return {
    id,
    correctSlot,
    alt: `Фрагмент ${correctSlot + 1}`,
    src: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="none">${scene}</svg>`,
    )}`,
  };
}

export const captchaPieces: CaptchaPiece[] = [
  createPiece("top-left", "0 0 180 180", 0),
  createPiece("top-right", "180 0 180 180", 1),
  createPiece("bottom-left", "0 180 180 180", 2),
  createPiece("bottom-right", "180 180 180 180", 3),
];
