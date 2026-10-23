import type { Metadata } from "next";
import styles from "./styles.module.css";

export const metadata: Metadata = {
  title: { default: "Inspiration library — A home for your ideas", template: "%s · Inspiration library" },
  description: "A personal place to collect images, links, and little sparks of inspiration. Private by default, shared when you choose.",
};
export const runtime = "nodejs";
export default function InspirationLibraryLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className={styles.root}><a className="skip-link" href="#main-content">Skip to content</a><div id="main-content">{children}</div></div>;
}
