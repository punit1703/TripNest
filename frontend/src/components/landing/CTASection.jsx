
import { motion } from 'framer-motion';
import { PlaneTakeoff } from 'lucide-react';
import styles from './CTASection.module.css';

const CTASection = () => {
  return (
    <section className={`section ${styles.cta}`}>
      <div className={`container ${styles.container}`}>
        <motion.div 
          className={styles.content}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className={styles.title}>Ready for your next adventure?</h2>
          <p className={styles.description}>
            Join thousands of travelers who are planning better trips, tracking expenses effortlessly, and creating unforgettable memories with TripNest.
          </p>
          <button className={`btn ${styles.btn}`}>
            Get Started for Free <PlaneTakeoff size={18} />
          </button>
          <p className={styles.smallText}>No credit card required. Cancel anytime.</p>
        </motion.div>
        
        {/* Decorative elements */}
        <div className={styles.circle1}></div>
        <div className={styles.circle2}></div>
      </div>
    </section>
  );
};

export default CTASection;
