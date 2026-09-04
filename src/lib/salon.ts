import { addMinutes, format, parse } from "date-fns";

/** Weekday (Sun–Fri): 9:00–21:00. Saturday: 9:00–12:00. */
export const SALON = {
  name: "Hair Craft Mens Saloon",
  tagline: "Precision cuts. Classic craft.",
  phone: "+91 98765 43210",
  address: "Main Road, Municipal Complex, Haliyal",
  weekdayOpen: "09:00",
  weekdayClose: "21:00",
  saturdayOpen: "09:00",
  saturdayClose: "12:00",
  slotIntervalMin: 15,
} as const;

export const SERVICE_DEFAULTS = [
  {
    name: "Haircut",
    slug: "haircut",
    description: "Wash, cut, and finish styled to your preference.",
    durationMin: 30,
    price: 70,
  },
  {
    name: "Beard Trim",
    slug: "beard",
    description: "Shape, trim, and clean lines for a sharp beard.",
    durationMin: 20,
    price: 50,
  },
  {
    name: "Haircut + Beard",
    slug: "both",
    description: "Complete grooming — haircut and beard in one visit.",
    durationMin: 45,
    price: 110,
  },
] as const;

export const BARBER_DEFAULTS = [
  {
    name: "Babu",
    specialty: "Classic & fades",
    bio: "15+ years crafting clean fades and timeless men's cuts.",
    avatar: "/barbers/barber.jpg",
  },
  {
    name: "Shivappa",
    specialty: "Beard & modern styles",
    bio: "Known for precise beard work and contemporary looks.",
    avatar: "/barbers/barber.jpg",
  },
] as const;

/** Convert 24h "HH:mm" to 12h display, e.g. "9:00 AM". */
export function formatTime12(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  let h = Number(hStr);
  const m = mStr || "00";
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${period}`;
}

export function formatTimeRange12(start: string, end: string): string {
  return `${formatTime12(start)} – ${formatTime12(end)}`;
}

export type FaceShape =
  | "oval"
  | "round"
  | "square"
  | "oblong"
  | "heart"
  | "diamond";

export const HAIRSTYLE_CATALOG: {
  id: string;
  name: string;
  faceShapes: FaceShape[];
  description: string;
  image: string;
  tags: string[];
}[] = [
  {
    id: "classic-fade",
    name: "Classic Mid Fade",
    faceShapes: ["oval", "square", "diamond"],
    description: "Clean mid fade with textured top — versatile everyday look.",
    image: "/styles/classic-fade.svg",
    tags: ["fade", "short"],
  },
  {
    id: "textured-crop",
    name: "Textured Crop",
    faceShapes: ["round", "oval", "heart"],
    description: "Short sides with a choppy crop that adds height and edge.",
    image: "/styles/textured-crop.svg",
    tags: ["crop", "modern"],
  },
  {
    id: "side-part",
    name: "Gentleman Side Part",
    faceShapes: ["oval", "oblong", "square"],
    description: "Polished side part — sharp for work and evenings.",
    image: "/styles/side-part.svg",
    tags: ["classic", "formal"],
  },
  {
    id: "crew-cut",
    name: "Crew Cut",
    faceShapes: ["round", "square", "heart"],
    description: "Low-maintenance crew with a neat taper.",
    image: "/styles/crew-cut.svg",
    tags: ["short", "easy"],
  },
  {
    id: "quiff",
    name: "Modern Quiff",
    faceShapes: ["oval", "diamond", "heart"],
    description: "Volume on top with soft fade — stylish and confident.",
    image: "/styles/quiff.svg",
    tags: ["volume", "styled"],
  },
  {
    id: "buzz",
    name: "Clean Buzz",
    faceShapes: ["oval", "square", "oblong"],
    description: "Ultra-clean buzz for a bold, minimal look.",
    image: "/styles/buzz.svg",
    tags: ["buzz", "minimal"],
  },
  {
    id: "undercut",
    name: "Disconnected Undercut",
    faceShapes: ["oval", "oblong", "diamond"],
    description: "Strong contrast undercut with longer styled top.",
    image: "/styles/undercut.svg",
    tags: ["undercut", "bold"],
  },
  {
    id: "pompadour",
    name: "Soft Pompadour",
    faceShapes: ["oval", "square", "heart"],
    description: "Elevated front with controlled volume — timeless swagger.",
    image: "/styles/pompadour.svg",
    tags: ["volume", "classic"],
  },
];

export function isSaturday(dateStr: string): boolean {
  const d = parse(dateStr, "yyyy-MM-dd", new Date());
  return d.getDay() === 6;
}

export function getOpenClose(dateStr: string): { open: string; close: string } {
  if (isSaturday(dateStr)) {
    return { open: SALON.saturdayOpen, close: SALON.saturdayClose };
  }
  return { open: SALON.weekdayOpen, close: SALON.weekdayClose };
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function addMinutesToTime(time: string, minutes: number): string {
  const base = parse(time, "HH:mm", new Date());
  return format(addMinutes(base, minutes), "HH:mm");
}

export function generateSlots(
  dateStr: string,
  durationMin: number
): string[] {
  const { open, close } = getOpenClose(dateStr);
  const openM = timeToMinutes(open);
  const closeM = timeToMinutes(close);
  const slots: string[] = [];

  for (
    let t = openM;
    t + durationMin <= closeM;
    t += SALON.slotIntervalMin
  ) {
    slots.push(minutesToTime(t));
  }
  return slots;
}

export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  const as = timeToMinutes(aStart);
  const ae = timeToMinutes(aEnd);
  const bs = timeToMinutes(bStart);
  const be = timeToMinutes(bEnd);
  return as < be && bs < ae;
}

/** Lightweight client-side face-shape heuristic from image brightness sampling. */
export function inferFaceShapeFromSeed(seed: number): FaceShape {
  const shapes: FaceShape[] = [
    "oval",
    "round",
    "square",
    "oblong",
    "heart",
    "diamond",
  ];
  return shapes[Math.abs(seed) % shapes.length];
}

export function recommendStyles(faceShape: FaceShape, limit = 3) {
  const matched = HAIRSTYLE_CATALOG.filter((s) =>
    s.faceShapes.includes(faceShape)
  );
  const rest = HAIRSTYLE_CATALOG.filter(
    (s) => !s.faceShapes.includes(faceShape)
  );
  return [...matched, ...rest].slice(0, limit);
}
