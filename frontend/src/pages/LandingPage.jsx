
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorks from '../components/landing/HowItWorks';
import AIPlannerShowcase from '../components/landing/AIPlannerShowcase';
import ExpenseTrackerShowcase from '../components/landing/ExpenseTrackerShowcase';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/layout/Footer';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <AIPlannerShowcase />
      <ExpenseTrackerShowcase />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;
