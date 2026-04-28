import type { Metadata } from 'next';
import StoryPage from './StoryPage';
import '../s/[token]/pass.css';
import '../s/[token]/lauren-ai.css';

export const metadata: Metadata = {
  title:       'Why I built RefundLocators — Nathan Johnson',
  description: 'I lost a home in Ohio. Nobody told me there was money I could claim. I built RefundLocators so the next person in my position has someone in their corner.',
  alternates:  { canonical: 'https://refundlocators.com/story' },
  openGraph:   {
    title:       'Why I built RefundLocators',
    description: 'I lost a home in Ohio. Nobody told me about the surplus. So I built this.',
    url:         'https://refundlocators.com/story',
    siteName:    'RefundLocators',
    type:        'article',
  },
};

export default function Page() { return <StoryPage />; }
