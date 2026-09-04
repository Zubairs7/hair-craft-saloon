import Image from "next/image";

type Props = {
  src: string | null | undefined;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-24 w-24",
};

export function BarberPhoto({ src, name, size = "md", className = "" }: Props) {
  const box = sizes[size];
  const isImage = !!src && (src.startsWith("/") || src.startsWith("http"));

  if (!isImage) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-craft-ink font-display text-xl text-craft-copper ${box} ${className}`}
      >
        {src || name[0]}
      </span>
    );
  }

  return (
    <span
      className={`relative block shrink-0 overflow-hidden rounded-full ring-2 ring-craft-copper/40 ${box} ${className}`}
    >
      <Image
        src={src!}
        alt={name}
        fill
        className="object-cover object-[center_20%]"
        sizes="96px"
      />
    </span>
  );
}
