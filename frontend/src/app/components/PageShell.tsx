import { ReactNode } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";

type PageShellProps = {
  children: ReactNode;
  mainClassName?: string;
  background?: ReactNode;
  overlayClassName?: string | null;
};

export default function PageShell({
  children,
  mainClassName,
  background,
  overlayClassName = "from-neutral-950/50 via-neutral-950/70 to-neutral-950",
}: PageShellProps) {
  const mainClasses = ["flex", "flex-col", "flex-1", "pt-20", "sm:pt-24"];
  if (mainClassName) {
    mainClasses.push(mainClassName);
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {background ? (
        <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden="true">
          <div className="relative h-full w-full overflow-hidden">{background}</div>
        </div>
      ) : null}
      {overlayClassName ? (
        <div
          className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b ${overlayClassName}`}
          aria-hidden="true"
        />
      ) : null}

      <NavBar />
      <main className={mainClasses.join(" ")}>{children}</main>
      <Footer />
    </div>
  );
}
