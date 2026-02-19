import { motion } from 'framer-motion';
import { Shield, Zap, Users, Lock, TrendingDown, Clock } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Blockchain Secured',
    description: 'Your funds are secured by Algorand blockchain technology—no central authority needed.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Transaction finality in under 4 seconds. Experience the speed of Algorand.',
  },
  {
    icon: Users,
    title: 'No Middlemen',
    description: 'Direct peer-to-peer payments without intermediaries taking a cut.',
  },
  {
    icon: TrendingDown,
    title: 'Low Fees',
    description: 'Pay minimal transaction fees—typically just a fraction of a cent.',
  },
  {
    icon: Clock,
    title: 'Instant Payments',
    description: 'Funds are sent directly to your wallet immediately, no waiting.',
  },
  {
    icon: Lock,
    title: 'Transparent & Secure',
    description: 'All transactions are verifiable on-chain. Full transparency guaranteed.',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AlgoSplit
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built on cutting-edge blockchain technology for the modern payment experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 rounded-2xl hover-lift"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
