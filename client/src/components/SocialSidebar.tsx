import { Twitter, Instagram, Facebook } from 'lucide-react';

const socialLinks = [
  {
    id: 'twitter',
    icon: Twitter,
    href: '#',
    label: 'Follow us on Twitter'
  },
  {
    id: 'instagram',
    icon: Instagram,
    href: '#',
    label: 'Follow us on Instagram'
  },
  {
    id: 'facebook',
    icon: Facebook,
    href: '#',
    label: 'Follow us on Facebook'
  }
];

export function SocialSidebar() {
  return (
    <aside className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40 flex flex-col space-y-4">
      {socialLinks.map(({ id, icon: Icon, href, label }) => (
        <a
          key={id}
          href={href}
          className="social-icon"
          aria-label={label}
          data-testid={`link-social-${id}`}
        >
          <Icon className="h-5 w-5" />
        </a>
      ))}
    </aside>
  );
}
