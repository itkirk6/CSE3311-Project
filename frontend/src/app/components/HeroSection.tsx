import { ReactNode } from "react";

type HeroSectionProps = {
  children: ReactNode;
  background?: ReactNode;
  className?: string;
  overlayClassName?: string;
  heightClassName?: string;
};

export default function HeroSection({
  children,
  background,
  className = "",
  overlayClassName = "from-neutral-950/60 via-neutral-950/30 to-neutral-900",
  heightClassName = "min-h-[540px] h-[75vh]",
}: HeroSectionProps) {
  const contentClasses = ["relative", "z-10", "flex", "h-full", "items-center"];
  if (className) {
    contentClasses.push(className);
  }

  return (
    <section className={`relative w-full overflow-hidden ${heightClassName}`}>
      {background ? <div className="absolute inset-0 -z-20">{background}</div> : null}
      <div className={`absolute inset-0 -z-10 bg-gradient-to-b ${overlayClassName}`} />
      <div className={contentClasses.join(" ")}>{children}</div>
    </section>
  );
}
