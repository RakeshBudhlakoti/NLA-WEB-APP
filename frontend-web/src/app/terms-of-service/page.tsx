import React from "react";

export default function TermsOfService() {
  return (
    <div className="flex-1 bg-background text-gray-900 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8">
          <span className="text-gray-900 block">TERMS OF</span>
          <span className="text-brand-yellow block">SERVICE</span>
        </h1>
        
        <div className="bg-surface border border-gray-100 rounded-2xl p-8 md:p-12 space-y-8 text-gray-600 leading-relaxed text-sm md:text-base">
          <p>Last updated: April 18, 2026</p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 tracking-wide">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the NLA Sports platform (&quot;Service&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 tracking-wide">2. User Accounts</h2>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>
            <p>
              You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 tracking-wide">3. Content and Conduct</h2>
            <p>
              Our Service allows you to post, link, store, share, and otherwise make available certain information, text, graphics, videos, or other material (&quot;Content&quot;). You are entirely responsible for the Content that you post to the Service.
            </p>
            <p>
              You agree not to use the Service to post any material which is defamatory, offensive, discriminatory, or violates any third-party rights. We reserve the right to remove any Content that violates these Terms or that we find objectionable.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 tracking-wide">4. Intellectual Property</h2>
            <p>
              The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of NLA Sports and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 tracking-wide">5. Termination</h2>
            <p>
              We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 tracking-wide">6. Changes</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 tracking-wide">7. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at: <a href="mailto:legal@nlasports.com" className="text-brand-yellow hover:underline">legal@nlasports.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
