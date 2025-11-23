import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <p className="text-muted-foreground text-lg mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-foreground/90 mb-4">
              Welcome to Cannabis Wellness Tracker. By accessing or using our service, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our service.
            </p>
            <p className="text-foreground/90 mb-4">
              These Terms constitute a legally binding agreement between you ("User," "you," or "your") and Cannabis Wellness Tracker ("we," "us," or "our"). By creating an account or using any part of the service, you acknowledge that you have read, understood, and agree to be bound by these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
            <p className="text-foreground/90 mb-4">
              You must meet the following requirements to use our service:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li>Be at least 18 years of age (or 21 years of age where required by law)</li>
              <li>Have the legal right to use cannabis in your jurisdiction</li>
              <li>Have the legal capacity to enter into a binding agreement</li>
              <li>Not be prohibited from using the service under any applicable laws</li>
            </ul>
            <p className="text-foreground/90 mt-4">
              By using our service, you represent and warrant that you meet these eligibility requirements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Medical Disclaimer</h2>
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
              <p className="text-foreground font-semibold mb-2">IMPORTANT MEDICAL DISCLAIMER</p>
              <p className="text-foreground/90">
                Cannabis Wellness Tracker is a personal tracking and journaling tool. It is NOT a medical device, diagnostic tool, or substitute for professional medical advice, diagnosis, or treatment.
              </p>
            </div>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li><strong>Not medical advice:</strong> The information and insights provided by our service are for informational purposes only and should not be considered medical advice</li>
              <li><strong>Consult healthcare professionals:</strong> Always seek the advice of your physician or other qualified health provider with any questions regarding a medical condition or cannabis use</li>
              <li><strong>No doctor-patient relationship:</strong> Use of our service does not create a doctor-patient relationship</li>
              <li><strong>Emergency situations:</strong> Never disregard professional medical advice or delay seeking it because of information provided by our service</li>
              <li><strong>Individual results vary:</strong> Insights and patterns shown in the app are based on your personal data and may not be applicable to others</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. User Accounts</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Account Creation</h3>
            <p className="text-foreground/90 mb-4">
              To use our service, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Account Security</h3>
            <p className="text-foreground/90 mb-4">
              You are responsible for maintaining the security of your account. We cannot and will not be liable for any loss or damage arising from your failure to comply with this security obligation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Permitted Uses</h3>
            <p className="text-foreground/90 mb-4">
              You may use our service for:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li>Tracking your personal cannabis consumption</li>
              <li>Recording observations and experiences</li>
              <li>Generating personal insights and trends</li>
              <li>Setting reminders for tracking or medication schedules</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Prohibited Uses</h3>
            <p className="text-foreground/90 mb-4">
              You agree NOT to use our service to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li>Violate any local, state, national, or international law or regulation</li>
              <li>Track cannabis consumption in jurisdictions where it is illegal</li>
              <li>Share or sell cannabis or facilitate illegal transactions</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Transmit any viruses, malware, or other malicious code</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Scrape, spider, or crawl the service or use automated means to access it</li>
              <li>Reverse engineer, decompile, or disassemble any part of the service</li>
              <li>Use the service for any commercial purpose without our prior written consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. User Content</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Your Content</h3>
            <p className="text-foreground/90 mb-4">
              You retain all rights to the content you create in the service, including your journal entries, notes, and other data ("User Content"). By using our service, you grant us a limited license to store, process, and display your User Content solely for the purpose of providing the service to you.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Content Responsibility</h3>
            <p className="text-foreground/90 mb-4">
              You are solely responsible for your User Content. You represent and warrant that:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li>You own or have the necessary rights to your User Content</li>
              <li>Your User Content does not violate any third-party rights</li>
              <li>Your User Content complies with these Terms and applicable laws</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Content Removal</h3>
            <p className="text-foreground/90 mb-4">
              We reserve the right to remove any User Content that violates these Terms or applicable laws, although we have no obligation to monitor User Content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <p className="text-foreground/90 mb-4">
              The service, including its design, features, graphics, text, and code, is owned by us and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works based on our service without our prior written consent.
            </p>
            <p className="text-foreground/90 mb-4">
              "Cannabis Wellness Tracker" and related logos are our trademarks. You may not use these marks without our prior written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Privacy</h2>
            <p className="text-foreground/90 mb-4">
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using our service, you agree to our Privacy Policy.
            </p>
            <p className="text-foreground/90">
              <a href="/privacy" className="text-primary hover:underline">Read our Privacy Policy →</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Legal Compliance</h2>
            <p className="text-foreground/90 mb-4">
              Cannabis laws vary by jurisdiction. You are solely responsible for:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li>Ensuring your cannabis use is legal in your jurisdiction</li>
              <li>Complying with all applicable local, state, and federal laws</li>
              <li>Understanding and following medical cannabis regulations if applicable</li>
              <li>Maintaining any required documentation or medical certifications</li>
            </ul>
            <p className="text-foreground/90 mt-4">
              We do not provide legal advice regarding cannabis use. Consult with legal professionals in your jurisdiction for guidance on compliance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
            <div className="p-4 bg-muted border border-border rounded-lg mb-4">
              <p className="text-foreground font-semibold mb-2">DISCLAIMER OF WARRANTIES</p>
              <p className="text-foreground/90">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
            </div>
            <p className="text-foreground/90 mb-4">
              To the fullest extent permitted by law, we shall not be liable for any:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or use</li>
              <li>Damages resulting from your use or inability to use the service</li>
              <li>Damages resulting from any conduct or content of third parties</li>
              <li>Unauthorized access to or alteration of your content</li>
            </ul>
            <p className="text-foreground/90 mt-4">
              Our total liability to you for all claims arising from or relating to the service shall not exceed the amount you paid us in the twelve (12) months preceding the claim, or $100, whichever is greater.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
            <p className="text-foreground/90 mb-4">
              You agree to indemnify, defend, and hold harmless Cannabis Wellness Tracker, its affiliates, officers, directors, employees, and agents from any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorneys' fees) arising from:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li>Your use of the service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your User Content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Termination by You</h3>
            <p className="text-foreground/90 mb-4">
              You may terminate your account at any time by using the account deletion feature in the application. Upon termination, your User Content will be deleted in accordance with our Privacy Policy.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Termination by Us</h3>
            <p className="text-foreground/90 mb-4">
              We reserve the right to suspend or terminate your account and access to the service at any time, with or without notice, for any reason, including:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li>Violation of these Terms</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Extended period of inactivity</li>
              <li>Technical or security reasons</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Effect of Termination</h3>
            <p className="text-foreground/90 mb-4">
              Upon termination, your right to use the service will immediately cease. Sections of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
            <p className="text-foreground/90 mb-4">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li>Posting the updated Terms with a new "Last Updated" date</li>
              <li>Sending you an email notification</li>
              <li>Displaying a prominent notice in the application</li>
            </ul>
            <p className="text-foreground/90 mt-4">
              Your continued use of the service after any changes constitutes acceptance of the updated Terms. If you do not agree to the updated Terms, you must stop using the service and may delete your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Changes to Service</h2>
            <p className="text-foreground/90 mb-4">
              We reserve the right to modify or discontinue the service (or any part thereof) at any time, with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">15. Governing Law and Dispute Resolution</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Governing Law</h3>
            <p className="text-foreground/90 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which we operate, without regard to its conflict of law provisions.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Dispute Resolution</h3>
            <p className="text-foreground/90 mb-4">
              Any dispute arising from these Terms or the service shall be resolved through:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li><strong>Informal resolution:</strong> Contact us first to attempt to resolve the dispute informally</li>
              <li><strong>Binding arbitration:</strong> If informal resolution fails, disputes will be resolved through binding arbitration</li>
              <li><strong>No class actions:</strong> You agree to bring claims only in your individual capacity and not as part of any class action</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">16. Miscellaneous</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Entire Agreement</h3>
            <p className="text-foreground/90 mb-4">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and us regarding the service.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Severability</h3>
            <p className="text-foreground/90 mb-4">
              If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Waiver</h3>
            <p className="text-foreground/90 mb-4">
              No waiver of any term shall be deemed a further or continuing waiver of such term or any other term.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Assignment</h3>
            <p className="text-foreground/90 mb-4">
              You may not assign or transfer these Terms or your rights hereunder without our prior written consent. We may assign these Terms without restriction.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Force Majeure</h3>
            <p className="text-foreground/90 mb-4">
              We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including acts of God, war, terrorism, natural disasters, or internet failures.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">17. Contact Information</h2>
            <p className="text-foreground/90 mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <ul className="list-none space-y-2 text-foreground/90">
              <li><strong>Email:</strong> legal@cannabiswellnesstracker.com</li>
              <li><strong>Support:</strong> support@cannabiswellnesstracker.com</li>
            </ul>
          </section>

          <div className="mt-12 p-6 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center mb-4">
              BY USING CANNABIS WELLNESS TRACKER, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
            </p>
            <p className="text-sm text-muted-foreground text-center">
              These Terms are effective as of the date stated above and will remain in effect except with respect to any changes in provisions in the future, which will be in effect immediately after being posted on this page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
