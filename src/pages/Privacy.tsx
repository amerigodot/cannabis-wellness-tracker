import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Privacy() {
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
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <p className="text-muted-foreground text-lg mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Commitment to Privacy</h2>
            <p className="text-foreground/90 mb-4">
              Cannabis Wellness Tracker is committed to protecting your privacy and ensuring the security of your personal health information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
            </p>
            <p className="text-foreground/90">
              We understand the sensitive nature of cannabis consumption tracking and take extraordinary measures to protect your data and maintain your privacy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Account Information</h3>
            <p className="text-foreground/90 mb-4">
              When you create an account, we collect:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li>Email address (for account authentication and recovery)</li>
              <li>Password (encrypted and never stored in plain text)</li>
              <li>Account creation date</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Journal Entry Data</h3>
            <p className="text-foreground/90 mb-4">
              When you log your cannabis consumption, we collect:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li>Strain names and consumption methods</li>
              <li>Dosage amounts and units</li>
              <li>Timestamps of consumption and entry creation</li>
              <li>Observations, activities, and side effects you report</li>
              <li>Personal notes you choose to add</li>
              <li>Icons and visual preferences for entries</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Reminder Data</h3>
            <p className="text-foreground/90 mb-4">
              When you set up reminders, we collect:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li>Reminder titles and descriptions</li>
              <li>Scheduled times and recurrence patterns</li>
              <li>Active/inactive status</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Technical Information</h3>
            <p className="text-foreground/90 mb-4">
              We automatically collect certain technical information:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li>Browser type and version</li>
              <li>Device type and operating system</li>
              <li>IP address (for security purposes only)</li>
              <li>Session duration and interaction patterns</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="text-foreground/90 mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li><strong>To provide and maintain the service:</strong> Store your journal entries, process your data, and enable core functionality</li>
              <li><strong>To generate insights:</strong> Analyze your consumption patterns and display trends and visualizations</li>
              <li><strong>To send notifications:</strong> Deliver reminders you've scheduled</li>
              <li><strong>To improve the application:</strong> Understand usage patterns to enhance features and user experience</li>
              <li><strong>To ensure security:</strong> Detect and prevent fraudulent activity, abuse, and security incidents</li>
              <li><strong>To communicate with you:</strong> Send important service updates and respond to your inquiries</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="text-foreground/90 mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li><strong>Encryption:</strong> All data is encrypted in transit using TLS/SSL and at rest using AES-256 encryption</li>
              <li><strong>Authentication:</strong> Secure authentication using modern protocols with password hashing</li>
              <li><strong>Access controls:</strong> Row-level security ensures you can only access your own data</li>
              <li><strong>Regular backups:</strong> Automated backups protect against data loss</li>
              <li><strong>Infrastructure security:</strong> Hosted on secure, compliant cloud infrastructure</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Sharing and Disclosure</h2>
            <p className="text-foreground/90 mb-4">
              <strong>We do not sell, rent, or share your personal data with third parties for marketing purposes.</strong>
            </p>
            <p className="text-foreground/90 mb-4">
              We may disclose your information only in the following limited circumstances:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li><strong>With your consent:</strong> When you explicitly authorize us to share specific information</li>
              <li><strong>Service providers:</strong> With trusted third-party service providers who assist in operating our service (e.g., hosting, analytics), under strict confidentiality agreements</li>
              <li><strong>Legal requirements:</strong> When required by law, court order, or legal process</li>
              <li><strong>Safety and protection:</strong> To protect the rights, property, or safety of our users or the public</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Rights and Choices</h2>
            <p className="text-foreground/90 mb-4">
              You have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li><strong>Access:</strong> Request a copy of all personal data we hold about you</li>
              <li><strong>Correction:</strong> Update or correct any inaccurate information in your account</li>
              <li><strong>Deletion:</strong> Request deletion of your account and all associated data</li>
              <li><strong>Export:</strong> Download your data in a portable format</li>
              <li><strong>Opt-out:</strong> Disable reminders and notifications at any time</li>
              <li><strong>Restriction:</strong> Limit how we process your data</li>
            </ul>
            <p className="text-foreground/90 mt-4">
              To exercise these rights, please contact us through the support channels provided in the application.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
            <p className="text-foreground/90 mb-4">
              We retain your data for as long as your account is active or as needed to provide you services. Specifically:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li><strong>Journal entries:</strong> Retained until you delete them or close your account</li>
              <li><strong>Deleted entries:</strong> Soft-deleted entries are permanently removed after 30 days</li>
              <li><strong>Account data:</strong> Retained until you request account deletion</li>
              <li><strong>Backups:</strong> Backup copies are automatically purged after 90 days</li>
            </ul>
            <p className="text-foreground/90 mt-4">
              When you delete your account, all your personal data is permanently deleted within 30 days, except where we're required to retain it for legal or regulatory purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
            <p className="text-foreground/90 mb-4">
              We use minimal cookies and similar technologies:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li><strong>Essential cookies:</strong> Required for authentication and core functionality</li>
              <li><strong>Preference cookies:</strong> Remember your theme and display preferences</li>
              <li><strong>Session storage:</strong> Temporarily store form data to improve user experience</li>
            </ul>
            <p className="text-foreground/90 mt-4">
              We do not use third-party advertising cookies or tracking pixels. We do not track you across other websites.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
            <p className="text-foreground/90 mb-4">
              Our service is not intended for individuals under the age of 18 (or 21 in jurisdictions where that is the legal age for cannabis use). We do not knowingly collect personal information from children. If you believe we have collected information from a minor, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">International Data Transfers</h2>
            <p className="text-foreground/90 mb-4">
              Your data may be stored and processed in any country where we or our service providers maintain facilities. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy, regardless of where it is processed.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p className="text-foreground/90 mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of any material changes by:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li>Posting the updated policy with a new "Last Updated" date</li>
              <li>Sending you an email notification (if you've provided an email address)</li>
              <li>Displaying a prominent notice in the application</li>
            </ul>
            <p className="text-foreground/90 mt-4">
              Your continued use of the service after any changes constitutes acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-foreground/90 mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <ul className="list-none space-y-2 text-foreground/90">
              <li><strong>Email:</strong> privacy@cannabiswellnesstracker.com</li>
              <li><strong>Response time:</strong> We aim to respond within 48 hours</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">California Privacy Rights (CCPA)</h2>
            <p className="text-foreground/90 mb-4">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li>Right to know what personal information is collected, used, shared, or sold</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of the sale of personal information (note: we do not sell personal information)</li>
              <li>Right to non-discrimination for exercising your privacy rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">European Privacy Rights (GDPR)</h2>
            <p className="text-foreground/90 mb-4">
              If you are in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR):
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Right to lodge a complaint with a supervisory authority</li>
            </ul>
          </section>

          <div className="mt-12 p-6 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              This Privacy Policy is effective as of the date stated above and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
