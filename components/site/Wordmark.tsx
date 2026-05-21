import Image from "next/image";
import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-tight",
        className,
      )}
    >
      <Image
        src="/logo-icon.png"
        alt=""
        aria-hidden
        width={28}
        height={28}
        priority
        className="size-7 rounded-md object-cover"
      />
      <span className="text-[15px]">Helm</span>
    </span>
  );
}
