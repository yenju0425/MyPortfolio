import React from 'react';
import Footer from './footer';
import Header from './header';
import styles from '@/styles/Layout.module.css'

/* Type checking for props */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.main}>
      <Header />
        <div>
          { children }
        </div>
      <Footer />
    </main>
  );
}

/* Another way to do it:
type LayoutProps = {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
*/