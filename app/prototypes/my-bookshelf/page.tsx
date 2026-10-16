import type { Metadata } from 'next';
import styles from './styles.module.css';

export const metadata: Metadata = {
  title: 'My bookshelf / 我的书架',
  description: 'A personal reading gallery powered by Notion.',
};

export default function BookshelfPage() {
  // A separate document keeps this prototype’s styles isolated from the portfolio.
  return <main className={styles.container}>
    <iframe className={styles.bookshelf} src="/prototypes/my-bookshelf/view" title="My bookshelf / 我的书架" />
  </main>;
}
