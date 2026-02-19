import { motion } from 'framer-motion';
import { PlusCircle, Share2, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: PlusCircle,
    title: 'Create a Link',
    description: 'Set up your split payment request with total amount and number of participants.',
    color: 'from-primary to-primary-light',
  },
  {
    icon: Share2,
    title: 'Share with Friends',
    description: 'Generate a unique payment link or QR code and share it with your group.',
    color: 'from-secondary to-accent',
  },
  {
    icon: CheckCircle,
    title: 'Get Paid Automatically',
    description: 'Track contributions in real-time. Funds are sent directly to your wallet with each payment.',
    color: 'from-accent to-primary',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started in three simple steps—no complex setup required
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative"
            >
              <div className="glass-card p-8 rounded-2xl hover-lift h-full">
                <div className="space-y-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-glow`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-primary">Step {index + 1}</span>
                    </div>
                    <h3 className="text-2xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
