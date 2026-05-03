import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="flex-1 bg-background text-gray-900 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8">
          <span className="text-gray-900 block">PRIVACY</span>
          <span className="text-brand-yellow block">POLICY</span>
        </h1>
        
        <div className="bg-surface border border-gray-100 rounded-2xl p-8 md:p-12 space-y-8 text-gray-600 leading-relaxed text-sm md:text-base">
          <p>Last updated: April 18, 2026</p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 tracking-wide">1. Information We Collect</h2>
            <p>
              At NLA Sports, we collect information that you provide directly to us when you create an account, build your athlete profile, submit stories, or communicate with us. This may include your name, email address, phone number, location, biography, competition history, and media (photos/videos).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 tracking-wide">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to operate, maintain, and provide the features and functionality of the Service. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Displaying your athlete profile to the community.</li>
              <li>Publishing your submitted stories and testimonials.</li>
              <li>Facilitating connections between users, coaches, and fans.</li>
              <li>Sending you technical notices, updates, security alerts, and support messages.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 tracking-wide">3. Sharing of Your Information</h2>
            <p>
              We may share your information as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Publicly:</strong> Your profile, stories, and testimonials are visible to the public by default to help you build your athletic presence.</li>
              <li><strong>With Service Providers:</strong> We may share information with third-party vendors who need access to such information to carry out work on our behalf.</li>
              <li><strong>For Legal Reasons:</strong> We may share information if we believe disclosure is in accordance with, or required by, any applicable law, regulation, or legal process.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 tracking-wide">4. Data Security</h2>
            <p>
              We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. However, no internet or email transmission is ever fully secure or error-free.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 tracking-wide">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:privacy@nlasports.com" className="text-brand-yellow hover:underline">privacy@nlasports.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
