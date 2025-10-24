import { ReactNode } from "react";

type SectionProps = {
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
};

export default function Section({ children, className = "", as: Component = "section" }: SectionProps) {
  const classes = ["mx-auto", "w-full", "max-w-7xl", "px-4", "sm:px-6", "lg:px-8"];
  if (className) {
    classes.push(className);
  }

  return <Component className={classes.join(" ")}>{children}</Component>;
}
