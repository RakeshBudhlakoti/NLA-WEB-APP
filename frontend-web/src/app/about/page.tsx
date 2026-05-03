import Link from "next/link";
import { Users, Target, Shield, ArrowRight, Activity, Trophy } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex-1 bg-background text-gray-900 pb-20">
      {/* Hero Section */}
      <div className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-brand-yellow/5 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-yellow/20 via-background to-background"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
            Fueling The <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-brand-yellow/70">Next Generation</span>
          </h1>
          <p className="text-lg md:text-xl text-muted leading-relaxed mb-10 max-w-2xl mx-auto">
            NLA Sports is a centralized hub for the wrestling and athletics community to share journeys, celebrate success, and inspire the champions of tomorrow.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/stories" className="bg-brand-yellow text-black font-bold px-8 py-4 rounded-xl hover:bg-brand-yellow/90 transition-all flex items-center gap-2">
              Explore Stories <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-brand-yellow/10 rounded-3xl blur-xl group-hover:bg-brand-yellow/20 transition-colors duration-500"></div>
            <div className="relative bg-surface border border-gray-100 p-8 md:p-12 rounded-3xl h-full flex flex-col justify-center">
              <div className="w-16 h-16 bg-brand-yellow/10 rounded-2xl flex items-center justify-center mb-8">
                <Target className="w-8 h-8 text-brand-yellow" />
              </div>
              <h2 className="text-3xl font-black mb-4">Our Mission</h2>
              <p className="text-muted leading-relaxed">
                To create a dedicated space where users, coaches, and fans can connect, share authentic experiences, and build a lasting legacy for niche sports. We believe every drop of sweat tells a story worth hearing.
              </p>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-4 bg-gray-50 rounded-3xl blur-xl group-hover:bg-gray-100 transition-colors duration-500"></div>
            <div className="relative bg-surface border border-gray-100 p-8 md:p-12 rounded-3xl h-full flex flex-col justify-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-8">
                <Activity className="w-8 h-8 text-gray-900" />
              </div>
              <h2 className="text-3xl font-black mb-4">Our Vision</h2>
              <p className="text-muted leading-relaxed">
                A world where the blood, sweat, and tears of niche sports users are recognized and celebrated universally. We aim to be the definitive platform that empowers users to own their narrative.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="container mx-auto px-4 py-20 border-t border-gray-100 mt-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black tracking-tight mb-4">Core Values</h2>
          <p className="text-muted max-w-2xl mx-auto">The principles that drive our platform and our community.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: <Users className="w-6 h-6 text-brand-yellow" />,
              title: "Community First",
              desc: "Everything we build is designed to strengthen the bonds between users, mentors, and supporters."
            },
            {
              icon: <Shield className="w-6 h-6 text-brand-yellow" />,
              title: "Authenticity",
              desc: "We celebrate the real journey—not just the victories, but the struggles, injuries, and comebacks."
            },
            {
              icon: <Trophy className="w-6 h-6 text-brand-yellow" />,
              title: "Excellence",
              desc: "Just like the users we serve, we strive for excellence in our design, technology, and user experience."
            }
          ].map((val, idx) => (
            <div key={idx} className="bg-surface border border-gray-100 p-8 rounded-2xl hover:border-brand-yellow/50 transition-colors duration-300 text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-background rounded-full flex items-center justify-center mb-6 shadow-inner border border-gray-100">
                {val.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{val.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Join CTA */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-brand-yellow rounded-3xl p-10 md:p-16 text-center text-black relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Ready to Share Your Journey?</h2>
            <p className="text-black/80 font-medium text-lg mb-8 leading-relaxed">
              Join thousands of users who are inspiring the next generation through their stories of resilience and triumph.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/submit" className="bg-white text-gray-900 font-bold px-8 py-4 rounded-xl hover:bg-white/80 transition-colors">
                Submit Your Story
              </Link>
              <Link href="/stories" className="bg-gray-50 text-black border-2 border-black font-bold px-8 py-4 rounded-xl hover:bg-white hover:text-gray-900 transition-colors">
                Read Stories
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
