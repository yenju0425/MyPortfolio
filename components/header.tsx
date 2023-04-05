import Link from 'next/link';
import Image from 'next/image';
import utilStyles from '../styles/utils.module.css';

import { useRouter } from 'next/router';

export default function Header() {
  const router = useRouter();
  return (
    <header className={utilStyles.topNav}>
      <nav className={utilStyles.navbarContainer}>
        <div className={utilStyles.avatarContainer}>
          <Image
            priority // Set to true to load the image immediately
            src="/R.svg"
            height={32}
            width={32}
            alt="Hi, I'm Rick."
          />
        </div>
        <ul className={utilStyles.linksContainer}>
          <li className={router.pathname === '/' ? utilStyles.active : ''}>
            Home
          </li>
          <li className={router.pathname === '/about' ? utilStyles.active : ''}>
            About
          </li>
          <li className={router.pathname === '/app' ? utilStyles.active : ''}>
            App
          </li>
          <li className={router.pathname === '/note' ? utilStyles.active : ''}>
            Note
          </li>
          <li className={router.pathname === '/contact' ? utilStyles.active : ''}>
            Contact
          </li>
        </ul>
      </nav>
    </header>
  );
};