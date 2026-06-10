
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        <div className={styles.brand}>
          <h2>TripNest</h2>
          <p>Your ultimate AI-powered travel companion.</p>
        </div>
        <div className={styles.links}>
          <div className={styles.column}>
            <h4>Product</h4>
            <a href="#">Features</a>
            <a href="#">Pricing</a>
            <a href="#">AI Planner</a>
          </div>
          <div className={styles.column}>
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Contact</a>
          </div>
          <div className={styles.column}>
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} TripNest. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
