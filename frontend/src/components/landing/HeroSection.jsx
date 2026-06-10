
import { motion } from 'framer-motion';
import { MapPin, Sparkles } from 'lucide-react';
import styles from './HeroSection.module.css';

const HeroSection = () => {
  return (
    <section className={`section ${styles.hero}`}>
      <div className={`container ${styles.container}`}>
        <motion.div 
          className={styles.content}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.badge}>
            <Sparkles size={16} />
            <span>AI-Powered Travel Planning</span>
          </div>
          <h1 className={styles.title}>
            Design Your Dream Trip with <span className="text-gradient">TripNest</span>
          </h1>
          <p className={styles.description}>
            Experience seamless travel planning, smart itineraries, and effortless expense tracking. All in one beautiful place.
          </p>
          <div className={styles.actions}>
            <button className="btn btn-primary">
              Start Planning <MapPin size={18} />
            </button>
            <button className="btn btn-outline">
              Watch Demo
            </button>
          </div>
        </motion.div>

        <motion.div 
          className={styles.visual}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className={`glass-card animate-float ${styles.mockup}`}>
            <div className={styles.mockupHeader}>
              <div className={styles.dots}>
                <span></span><span></span><span></span>
              </div>
              <div className={styles.url}>tripnest.app/plan</div>
            </div>
            <div className={styles.mockupBody}>
              <div className={styles.mockupMap}></div>
              <div className={styles.mockupCards}>
                <div className={styles.cardSkeleton}></div>
                <div className={styles.cardSkeleton}></div>
                <div className={styles.cardSkeleton}></div>
              </div>
            </div>
          </div>
          <div className={styles.glow}></div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
