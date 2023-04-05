import Link from 'next/link';
import Image from 'next/image';
import layoutStyles from '../styles/Layout.module.css';

import { useRouter } from 'next/router';

export default function Header() {
  const router = useRouter();
  return (
    <header className={layoutStyles.topNav}>
      <nav className={layoutStyles.navbarContainer}>
        <div className={layoutStyles.iconContainer}>
          <Image
            priority // Set to true to load the image immediately
            src="/R.svg"
            height={32}
            width={32}
            alt="Hi, I'm Rick."
          />
        </div>
        <ul className={layoutStyles.linksContainer}>
          <li className={router.pathname === '/' ? layoutStyles.active : ''}>
            Home
          </li>
          <li className={router.pathname === '/about' ? layoutStyles.active : ''}>
            About
          </li>
          <li className={router.pathname === '/poker' ? layoutStyles.active : ''}>
            Poker
          </li>
          <li className={router.pathname === '/notes' ? layoutStyles.active : ''}>
            Notes
          </li>
          <li className={router.pathname === '/contact' ? layoutStyles.active : ''}>
            Contact
          </li>
        </ul>
      </nav>
    </header>
  );
};
