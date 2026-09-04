import { StyleAIStudio } from "@/components/StyleAIStudio";

export const metadata = {
  title: "Style AI",
};

export default function StyleAIPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6 pb-28">
      <StyleAIStudio />
    </div>
  );
}
