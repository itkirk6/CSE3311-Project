import { ReactNode, RefObject } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";

type SolidBackground = {
  type: "solid";
  className?: string;
};

type ImageBackground = {
  type: "image";
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
};

type VideoBackground = {
  type: "video";
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  videoRef?: RefObject<HTMLVideoElement>;
};

type BackgroundMedia = SolidBackground | ImageBackground | VideoBackground;

type PageShellProps = {
  children: ReactNode;
  mainClassName?: string;
  backgroundMedia: BackgroundMedia;
  overlayClassName?: string | null;
};

function renderBackground(media: BackgroundMedia) {
  switch (media.type) {
    case "solid": {
      return <div className={`h-full w-full ${media.className ?? "bg-neutral-950"}`} />;
    }
    case "image": {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.src}
          alt={media.alt}
          loading={media.loading ?? "lazy"}
          className={`h-full w-full object-cover ${media.className ?? ""}`.trim()}
        />
      );
    }
    case "video": {
      const { autoPlay = true, loop = true, muted = true, playsInline = true } = media;
      return (
        <video
          ref={media.videoRef}
          className={`h-full w-full object-cover ${media.className ?? ""}`.trim()}
          src={media.src}
          poster={media.poster}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          preload="metadata"
          disablePictureInPicture
          controls={false}
          aria-hidden="true"
        />
      );
    }
    default: {
      return null;
    }
  }
}

export default function PageShell({
  children,
  mainClassName,
  backgroundMedia,
  overlayClassName = "from-neutral-950/60 via-neutral-950/70 to-neutral-950",
}: PageShellProps) {
  const mainClasses = ["flex", "flex-col", "flex-1", "pt-20", "sm:pt-24"];
  if (mainClassName) {
    mainClasses.push(mainClassName);
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-20 overflow-hidden" aria-hidden="true">
        {renderBackground(backgroundMedia)}
        {overlayClassName ? (
          <div className={`absolute inset-0 bg-gradient-to-b ${overlayClassName}`} />
        ) : null}
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <NavBar />
        <main className={mainClasses.join(" ")}>{children}</main>
        <Footer />
      </div>
    </div>
  );
}

export type { BackgroundMedia };
