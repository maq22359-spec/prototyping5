import type { Metadata } from 'next';
import NameScene from './NameScene';

export const metadata: Metadata = {
  title: 'MA QIANYI / Kate — A name in three moods',
  description: 'MA QIANYI / Kate, written across rain, stickers, and a daydream.',
};

export default function NamePage() {
  return <NameScene />;
}
