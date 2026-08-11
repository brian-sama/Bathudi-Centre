import React from 'react';
import { Page } from '../types';

interface PrivacyPolicyProps {
  onNavigate: (page: Page) => void;
}

const CONTACT = {
  company: 'Bathudi Automotive Technical Training Centre',
  physical: '771 Helen Street, Hermanstad, Pretoria, South Africa',
  phone: '+27 68 917 6294',
  email: 'infobathuditraing@gmail.com',
};

interface Section {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

const SECTIONS: Section[] = [
  {
    id: 'introduction',
    title: '1. Introduction',
    paragraphs: [
      `Welcome to the website of ${CONTACT.company} ("Bathudi", "we", "us", or "our"). We respect your privacy and are committed to protecting your personal information in accordance with the Protection of Personal Information Act 4 of 2013 ("POPIA") and other applicable South African laws.`,
      `This Privacy Policy explains what personal information we collect, how we use it, how we store and protect it, and the rights you have over it. By using our website or submitting an application, you consent to the collection, processing and use of your personal information as described in this policy. Please read it carefully.`,
      `If you do not agree with any part of this policy, please do not use our website or submit your personal information to us.`,
    ],
  },
  {
    id: 'who-we-are',
    title: '2. Who We Are',
    paragraphs: [
      `${CONTACT.company} is an automotive technical training centre based in South Africa. We are a QCTO-accredited institution that offers accredited automotive skills programmes to learners.`,
    ],
    bullets: [
      `Company: ${CONTACT.company}`,
      `Physical address: ${CONTACT.physical}`,
      `Phone: ${CONTACT.phone}`,
      `Email: ${CONTACT.email}`,
    ],
  },
  {
    id: 'information-we-collect',
    title: '3. Information We Collect',
    paragraphs: [
      `We collect personal information that you voluntarily provide to us, as well as certain technical information automatically collected when you visit our website.`,
      `When you complete our application form or otherwise contact us, we may collect the following categories of personal information:`,
    ],
    bullets: [
      'Contact and identity details: first name, surname, age, country, mobile/phone number and email address.',
      'Identity document details: your South African ID number or passport details.',
      'Residential and academic information: residential address, education level and previous school.',
      'Application details: the course you are applying for and your preferred funding type.',
      'Document uploads: certified copy of your ID document or passport, matric/school certificate, proof of payment and any additional supporting documents you choose to provide.',
      'Payment-related information: when you pay your registration/assessment fee, payment is processed by our third-party payment provider (PayFast). We do not store your full banking or card details.',
      'Communications: any correspondence you send us by email, WhatsApp or through our website, including messages, questions and enquiries.',
    ],
  },
  {
    id: 'technical-data',
    title: '4. Technical and Usage Information (Cookies & Logs)',
    paragraphs: [
      'When you visit our website, certain technical information is automatically collected, including your IP address, browser type, device type, pages visited, referring URLs and the date and time of your visit. This information is used to operate, maintain and improve the website and to understand how visitors use it.',
      'We may place cookies and similar technologies on your device to remember your preferences and enhance your browsing experience. Most browsers allow you to refuse or disable cookies. If you disable cookies, some parts of our website may not function properly.',
    ],
  },
  {
    id: 'how-we-use',
    title: '5. How We Use Your Information',
    paragraphs: [
      'We process your personal information for the following purposes:',
    ],
    bullets: [
      'To process, evaluate and manage your application for admission to the training programmes.',
      'To contact you regarding your application, registration and any relevant updates.',
      'To administer your enrolment and student records if you are accepted into a programme.',
      'To process registration, assessment and course fee payments.',
      'To provide and improve our training services.',
      'To respond to your enquiries via email, WhatsApp, phone or social media.',
      'To comply with our legal, regulatory, accreditation (QCTO) and audit obligations, and to exercise or defend our legal rights.',
      'To maintain the security and integrity of our website and systems.',
      'With your consent, to send you information about our courses, events and offerings. You may opt out at any time.',
    ],
  },
  {
    id: 'legal-basis',
    title: '6. Legal Basis for Processing',
    paragraphs: [
      'We process personal information on one or more of the following grounds, in line with POPIA:',
    ],
    bullets: [
      'Consent where you have given us permission to process your information (for example, when you submit an application or sign up for marketing).',
      'Performance of a contract, such as processing your application, registration and fee payments.',
      'Compliance with a legal obligation, including QCTO/accreditation, tax and record-keeping requirements.',
      'Legitimate interests, such as protecting our website and services and responding to enquiries, provided these do not unjustifiably infringe your rights.',
    ],
  },
  {
    id: 'sharing',
    title: '7. How We Share Your Information',
    paragraphs: [
      'We do not sell, rent or trade your personal information. We only share it in the circumstances described below:',
    ],
    bullets: [
      'Service providers: We share limited information with trusted service providers who help us operate our services, such as our payment processor (PayFast) and website hosting providers. They are only permitted to use your information for the purposes we specify.',
      'Accrediting and regulatory bodies: We may disclose information where required by QCTO, SETAs, the Department of Higher Education and Training, SARS or other authorities, as required by law.',
      'Legal compliance: We may disclose information where required by law, regulation, legal process, or to protect the rights, property or safety of Bathudi, our learners, or others.',
      'With your consent: We may share your information with third parties where you have given us your explicit consent to do so.',
    ],
  },
  {
    id: 'cross-border',
    title: '8. Cross-Border Transfers',
    paragraphs: [
      'Your personal information is generally stored and processed in South Africa. Where any of our service providers process information outside South Africa (for example, payment processing or hosting services), we take reasonable steps to ensure that such providers are subject to laws, binding agreements or mechanisms providing an adequate level of protection similar to POPIA.',
    ],
  },
  {
    id: 'security',
    title: '9. How We Protect Your Information',
    paragraphs: [
      'We take the security of your personal information seriously and implement reasonable technical and organisational measures to safeguard it against loss, damage, unauthorised access, alteration or disclosure. These include access controls, secure storage, and restricting access to personal information to authorised personnel only.',
      'Please note that no method of transmission over the internet or method of electronic storage is completely secure. While we strive to protect your personal information, we cannot guarantee its absolute security, and you transmit information to us at your own risk.',
    ],
  },
  {
    id: 'retention',
    title: '10. How Long We Keep Your Information',
    paragraphs: [
      'We retain personal information only for as long as necessary to fulfil the purposes described in this policy, unless a longer retention period is required or permitted by law (for example, for accreditation, taxation, audit or legal obligations). We will securely delete, de-identify or destroy your personal information once it is no longer needed.',
    ],
  },
  {
    id: 'your-rights',
    title: '11. Your Rights',
    paragraphs: [
      'In terms of POPIA, you have the right to:',
    ],
    bullets: [
      'Access the personal information we hold about you.',
      'Request the correction, updating or deletion of your personal information where it is inaccurate, incomplete or no longer necessary.',
      'Object to the processing of your personal information.',
      'Withdraw any consent you have given us at any time.',
      'Lodge a complaint regarding our processing of your personal information with the Information Regulator (South Africa).',
    ],
  },
  {
    id: 'children',
    title: '12. Minors',
    paragraphs: [
      `Our programmes are aimed at youth and learners, some of whom may be under the age of 18. Where we process the personal information of a minor, we only do so with the consent of a competent person (such as a parent or guardian) or where the information is provided for the purpose of the minor's application and training, as permitted by law.`,
    ],
  },
  {
    id: 'third-party-links',
    title: '13. Third-Party Links',
    paragraphs: [
      'Our website may contain links to third-party websites (such as our social media pages, Google Drive video content, or our payment provider). These websites have their own privacy policies, and we are not responsible for their privacy practices or content. We encourage you to review the privacy policies of any third-party website you visit.',
    ],
  },
  {
    id: 'changes',
    title: '14. Changes to This Policy',
    paragraphs: [
      `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. Any changes will be posted on this page with an updated effective date. We encourage you to review this page periodically to stay informed. Material changes will be communicated where appropriate.`,
    ],
  },
  {
    id: 'contact',
    title: '15. Contact Us',
    paragraphs: [
      'If you have any questions, concerns, or requests regarding this Privacy Policy or the handling of your personal information, or if you wish to exercise any of your rights, please contact us at:',
    ],
    bullets: [
      `Company: ${CONTACT.company}`,
      `Phone: ${CONTACT.phone}`,
      `Email: ${CONTACT.email}`,
      `Address: ${CONTACT.physical}`,
      `Alternatively, you may lodge a complaint with the Information Regulator (South Africa) at enquiries@inforegulator.org.za or by visiting their website.`,
    ],
  },
];
// Update this date whenever the policy is revised.
const LAST_UPDATED = '8 November 2026';

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
  const goToApply = () => {
    onNavigate(Page.Apply);
  };

  return (
    <div className="pt-28 pb-20 bg-slate-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => onNavigate(Page.Home)}
            className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm mb-8 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
          <h1 className="text-3xl md:text-5xl font-orbitron font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-sm mb-1">
            Effective date: {LAST_UPDATED}
          </p>
          <p className="text-gray-500 text-sm">
            Policy applies to {CONTACT.company} and its website.
          </p>
        </div>

        {/* Intro box */}
        <div className="glass border border-white/10 rounded-2xl p-6 mb-12">
          <p className="text-gray-300 text-sm leading-relaxed">
            This Privacy Policy is provided by {CONTACT.company} ("we", "us", "our") in line with the
            Protection of Personal Information Act 4 of 2013 ("POPIA"). It describes how we collect,
            use, store and protect your personal information when you visit our website, contact us,
            or submit an application for training.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="text-xl md:text-2xl font-orbitron font-bold text-white mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-400 shrink-0 mr-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
                {section.title}
              </h2>
              {section.paragraphs?.map((p, i) => (
                <p key={i} className="text-gray-300 text-sm md:text-base leading-relaxed mb-3">
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="space-y-2 mb-2">
                  {section.bullets.map((b, i) => (
                    <li key={i} className="flex items-start text-gray-300 text-sm md:text-base leading-relaxed">
                      <span className="text-blue-400 mr-2 mt-0.5">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 glass border border-white/10 rounded-2xl p-8 text-center">
          <h3 className="text-xl md:text-2xl font-orbitron font-bold text-white mb-3">
            Ready to Apply?
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            By submitting an application you agree to the terms described in this Privacy Policy.
          </p>
          <button
            onClick={goToApply}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 px-6 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/25"
          >
            <span>Apply Now</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;