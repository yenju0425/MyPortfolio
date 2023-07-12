import Link from 'next/link';
import styles from '@/styles/About.module.css'
import { useEffect, useState } from 'react';

export default function About() {
  let commingSoonIndex = 0;
  const comningSoons = ["Comming Soon", ".Comming Soon.", "..Comming Soon..", "...Comming Soon..."];

  const [commingSoonString, setCommingSoonString] = useState(comningSoons[commingSoonIndex]);

  const setCommingSoonTimer = () => {
    setTimeout(() => {
      console.log(commingSoonIndex);
      commingSoonIndex = (commingSoonIndex + 1) % comningSoons.length;
      setCommingSoonString(comningSoons[commingSoonIndex]);
      setCommingSoonTimer();
    }, 1000);
  }

  useEffect(() => {
    console.log("useEffect");
    setCommingSoonTimer();
  }, []);

  return (
    <>
      <main className={styles.main}>
        <div>
        </div>

        <div className={styles.contents}>
          <h1 className={styles.title}>
            {commingSoonString}
          </h1>

          <Link href="/Games/sng" className={styles.pokerLink}>
            <span>Check out the SNG Poker Game</span>
          </Link>
        </div>

        <div>
        </div>
      </main>
    </>
  )
}