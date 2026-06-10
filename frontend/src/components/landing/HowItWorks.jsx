
import { motion } from 'framer-motion';
import styles from './HowItWorks.module.css';

const steps = [
  {
    number: '01',
    title: 'Tell us about your dream trip',
    description: 'Input your destination, dates, budget, and interests. Our AI will analyze millions of data points to craft the perfect itinerary.',
  },
  {
    number: '02',
    title: 'Review & customize',
    description: 'Get a fully planned itinerary in seconds. Easily swap activities, change restaurants, or adjust timings to your liking.',
  },
  {
    number: '03',
    title: 'Invite friends & track expenses',
    description: 'Share the plan with travel buddies. Log expenses on the go and let TripNest calculate who owes who automatically.',
  }
];

const HowItWorks = () => {
  return (
    <section className={`section ${styles.howItWorks}`}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>How <span className="text-gradient">TripNest</span> Works</h2>
          <p className={styles.subtitle}>Three simple steps to your next great adventure.</p>
        </div>

        <div className={styles.stepsContainer}>
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className={styles.step}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className={styles.stepNumber}>{step.number}</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            </motion.div>
          ))}
          <div className={styles.line}></div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
