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
