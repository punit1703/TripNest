
import { motion } from 'framer-motion';
import { PieChart, ArrowRight, Receipt, Users } from 'lucide-react';
import styles from './ExpenseTrackerShowcase.module.css';

const ExpenseTrackerShowcase = () => {
  return (
    <section className={`section ${styles.showcase}`}>
      <div className={`container ${styles.container}`}>
        
        <motion.div 
          className={styles.visual}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className={styles.dashboard}>
            <div className={styles.dashboardHeader}>
              <h3>Trip Budget</h3>
              <div className={styles.totalAmount}>$1,240.00</div>
              <div className={styles.progressContainer}>
                <div className={styles.progressBar} style={{ width: '65%' }}></div>
              </div>
              <div className={styles.budgetMeta}>
                <span>$660 left</span>
                <span>$1,900 budget</span>
              </div>
            </div>
            
            <div className={styles.transactions}>
              <div className={styles.transaction}>
                <div className={styles.iconBox}><Receipt size={16} /></div>
                <div className={styles.details}>
                  <div className={styles.name}>Flight to Kyoto</div>
                  <div className={styles.category}>Transport</div>
                </div>
                <div className={styles.amount}>$450.00</div>
              </div>
              <div className={styles.transaction}>
                <div className={styles.iconBox}><Users size={16} /></div>
                <div className={styles.details}>
                  <div className={styles.name}>Dinner at Izakaya</div>
                  <div className={styles.category}>Food • Split 2 ways</div>
                </div>
                <div className={styles.amount}>$45.50</div>
              </div>
              <div className={styles.transaction}>
                <div className={styles.iconBox}><Receipt size={16} /></div>
                <div className={styles.details}>
                  <div className={styles.name}>Hotel (3 Nights)</div>
                  <div className={styles.category}>Accommodation</div>
                </div>
                <div className={styles.amount}>$320.00</div>
              </div>
            </div>
          </div>
          <div className={styles.glow}></div>
        </motion.div>

        <motion.div 
          className={styles.content}
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.iconWrapper}>
            <PieChart size={28} />
          </div>
          <h2 className={styles.title}>Track expenses & <span className="text-gradient">split bills</span> easily</h2>
          <p className={styles.description}>
            Money matters shouldn't ruin a good trip. TripNest's integrated expense tracker lets you log costs instantly, upload receipts, and automatically calculates who owes who.
          </p>
          <ul className={styles.featureList}>
            <li>Real-time budget tracking</li>
            <li>Automatic currency conversion</li>
            <li>Fair splitting algorithms</li>
            <li>Receipt scanning (Coming soon)</li>
          </ul>
          <button className={`btn btn-outline ${styles.btn}`}>
            Explore Features <ArrowRight size={18} />
          </button>
        </motion.div>
        
      </div>
    </section>
  );
};

export default ExpenseTrackerShowcase;
