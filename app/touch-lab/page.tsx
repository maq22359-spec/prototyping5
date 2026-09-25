import type { Metadata } from 'next';
import TouchLab from './TouchLab';

export const metadata: Metadata = {
  title: 'Catch Me — Interactive Gaze',
  description: 'A video portrait whose gaze follows your cursor, responding to your movement speed.',
};

export default function TouchLabPage() {
  return <TouchLab />;
}
