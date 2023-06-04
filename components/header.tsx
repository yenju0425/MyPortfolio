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
            <Link href="/">Home</Link>
          </li>
          <li className={router.pathname === '/about' ? layoutStyles.active : ''}>
            <Link href="/about">About</Link>
          </li>
          <li className={router.pathname === '/Games/sng' ? layoutStyles.active : ''}>
            <Link href="/Games/sng">SNG</Link>
          </li>
          <li className={router.pathname === '/notes' ? layoutStyles.active : ''}>
            <Link href="/notes">Notes</Link>
          </li>
          <li className={router.pathname === '/contact' ? layoutStyles.active : ''}>
            <Link href="/contact">Contact</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};
