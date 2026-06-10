
import { motion } from 'framer-motion';
import { BrainCircuit, Wallet, Users, Calendar, Map, Bell } from 'lucide-react';
import styles from './FeaturesSection.module.css';

const features = [
  {
    icon: <BrainCircuit size={24} />,
    title: 'AI Itinerary Planner',
    description: 'Generate personalized, day-by-day travel itineraries based on your interests and budget in seconds.',
  },
  {
    icon: <Wallet size={24} />,
    title: 'Smart Expense Tracker',
    description: 'Keep track of all your trip costs, split bills with friends, and stay perfectly within budget.',
  },
  {
    icon: <Users size={24} />,
    title: 'Collaborative Planning',
    description: 'Invite friends to view, edit, and vote on activities in real-time. Travel planning made social.',
  },
  {
    icon: <Calendar size={24} />,
    title: 'Unified Calendar',
    description: 'Sync your flights, hotels, and activities into one beautifully organized visual timeline.',
  },
  {
    icon: <Map size={24} />,
    title: 'Interactive Maps',
    description: 'Visualize your daily routes and discover nearby attractions automatically suggested by AI.',
  },
  {
    icon: <Bell size={24} />,
    title: 'Smart Alerts',
    description: 'Receive real-time notifications about flight changes, upcoming reservations, and budget limits.',
  }
];

const FeaturesSection = () => {
  return (
    <section className={`section ${styles.features}`}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Everything you need for the <span className="text-gradient">perfect trip</span></h2>
          <p className={styles.subtitle}>
            TripNest combines powerful AI with intuitive design to handle all the complex logistics of travel planning.
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className={`glass-card ${styles.card}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={styles.iconWrapper}>
                {feature.icon}
              </div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDescription}>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
