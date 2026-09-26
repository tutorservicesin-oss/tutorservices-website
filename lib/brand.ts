export type LogoPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type BrandKit = {
  name: string;
  productName: string;
  tagline: string;
  logoPath: string;
  colors: {
    blue950: string;
    blue900: string;
    blue700: string;
    blue500: string;
    green700: string;
    green500: string;
    ink: string;
    canvas: string;
    warm: string;
  };
  typography: {
    headline: string;
    body: string;
  };
  defaultCta: string;
  defaultLogoPosition: LogoPosition;
  defaultLogoScale: number;
};

export const defaultBrandKit: BrandKit = {
  name: "TutorServices",
  productName: "TutorServices AI Ad Studio",
  tagline: "Learn Smarter, Achieve Faster",
  logoPath: "/branding/tutorservices-logo.jpeg",
  colors: {
    blue950: "#071d49",
    blue900: "#0b327d",
    blue700: "#075ed6",
    blue500: "#1688ff",
    green700: "#009b7a",
    green500: "#19c89c",
    ink: "#111827",
    canvas: "#f5f8fb",
    warm: "#f7b84b",
  },
  typography: {
    headline: "Arial, Helvetica, sans-serif",
    body: "Arial, Helvetica, sans-serif",
  },
  defaultCta: "Book Now",
  defaultLogoPosition: "top-left",
  defaultLogoScale: 0.18,
};
