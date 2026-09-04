import { Suspense } from "react";
import { BookingWizard } from "@/components/BookingWizard";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Book appointment",
};

export default function BookPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6 pb-28">
      <Suspense
        fallback={
          <div className="flex justify-center py-24 text-craft-ink/50">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        }
      >
        <BookingWizard />
      </Suspense>
    </div>
  );
}
