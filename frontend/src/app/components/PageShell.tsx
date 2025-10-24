import { ReactNode } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";

type PageShellProps = {
  children: ReactNode;
  mainClassName?: string;
};

export default function PageShell({ children, mainClassName }: PageShellProps) {
  const mainClasses = ["flex", "flex-col", "flex-1", "pt-20", "sm:pt-24"];
  if (mainClassName) {
    mainClasses.push(mainClassName);
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <NavBar />
      <main className={mainClasses.join(" ")}>{children}</main>
      <Footer />
    </div>
  );
}
