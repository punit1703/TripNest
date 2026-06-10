
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import styles from './AIPlannerShowcase.module.css';

const AIPlannerShowcase = () => {
  return (
    <section className={`section ${styles.showcase}`}>
      <div className={`container ${styles.container}`}>
        <motion.div 
          className={styles.content}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.iconBox}>
            <Sparkles size={28} />
          </div>
          <h2 className={styles.title}>Meet your personal <span className="text-gradient">AI Travel Agent</span></h2>
          <p className={styles.description}>
            Say goodbye to dozens of open tabs. Our AI understands your preferences and crafts a balanced, realistic itinerary complete with travel times, reservation links, and insider tips.
          </p>
          <ul className={styles.featureList}>
            <li><Sparkles size={16} className={styles.listIcon} /> Optimizes routes to minimize travel time</li>
            <li><Sparkles size={16} className={styles.listIcon} /> Suggests hidden gems based on your vibe</li>
            <li><Sparkles size={16} className={styles.listIcon} /> Adapts instantly if you change your mind</li>
          </ul>
          <button className={`btn btn-primary ${styles.btn}`}>
            Try AI Planner <ArrowRight size={18} />
          </button>
        </motion.div>

        <motion.div 
          className={styles.visual}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className={styles.chatInterface}>
            <div className={styles.chatHeader}>
              <div className={styles.avatar}></div>
              <div>
                <div className={styles.name}>TripNest AI</div>
                <div className={styles.status}>Online</div>
              </div>
            </div>
            <div className={styles.chatBody}>
              <div className={styles.messageUser}>
                Plan a 3-day trip to Kyoto for two, focusing on culture and food. Budget is moderate.
              </div>
              <div className={styles.messageBot}>
                <div className={styles.botThinking}>
                  <Sparkles size={14} /> Generating perfect itinerary...
                </div>
                <div className={styles.botResult}>
                  <strong>Day 1: Classic Kyoto</strong><br/>
                  09:00 AM - Fushimi Inari Taisha<br/>
                  12:30 PM - Lunch at Nishiki Market<br/>
                  03:00 PM - Kiyomizu-dera Temple
                </div>
              </div>
            </div>
          </div>
          <div className={styles.glow}></div>
        </motion.div>
      </div>
    </section>
  );
};

export default AIPlannerShowcase;
