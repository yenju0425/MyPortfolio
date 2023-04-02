import Link from 'next/link';
import Image from 'next/image';
import utilStyles from '../styles/utils.module.css';

export default function Header() {
  return (
    <header>
      <div>
        <div className="topNav">
          <Image
            priority // Set to true to load the image immediately
            src="/images/cyberpunk.gif"
            className={utilStyles.borderCircle}
            height={64}
            width={64}
            alt="R!ck Ye110w"
          />
          <nav>

          </nav>
        </div>

      </div>
    </header>
  );
};