// Single source of truth for the Home page's section ids + titles.
// index.astro reads `label` for each RetroPanel's title, and TopBar reads
// the same list for the MENU dropdown — edit a title here once and both
// update together.
export const homeSections = [
  { id: "about-txt", label: "About me" },
  { id: "experience-exe", label: "Work experience" },
  { id: "education-dat", label: "Education" },
  { id: "courses-log", label: "Courses & conferences" },
  { id: "projects-zip", label: "Projects" },
  { id: "skills-sys", label: "Skills" },
  { id: "contact-cfg", label: "Contact" },
];

export const gigPhotosSectionId = "gig-photos-dir";

// Single source of truth for the three top-level pages' names — used for
// the bottom nav buttons (StatusBar), the MENU dropdown's section label
// (TopBar), each page's <h1>, and its browser-tab title. Edit a label here
// once and all of those update together.
// `mobile` is what the bottom nav button shows on phones instead of the full
// label: either short text, or the name of a pixel icon in src/assets/icons.
export type MobileLabel = { text: string } | { icon: "camera" | "tune" };

export const sitePages: {
  id: string;
  label: string;
  href: string;
  mobile: MobileLabel;
}[] = [
  { id: "home", label: "Resume", href: "/", mobile: { text: "CV" } },
  { id: "photography", label: "Analog Playground", href: "/photography", mobile: { icon: "camera" } },
  { id: "music", label: "Yoshee", href: "/music", mobile: { icon: "tune" } },
];
