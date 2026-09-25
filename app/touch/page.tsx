import type { Metadata } from 'next';
import TouchScene from './TouchScene';

export const metadata: Metadata = {
  title: 'A Bit of Me — Interactive Study by MA QIANYI',
  description: 'A video portrait whose gaze follows your cursor, responding to your movement speed.',
};

export default function TouchPage() {
  return <TouchScene />;
}
