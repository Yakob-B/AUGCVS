import React from 'react'
import { Link } from 'react-router-dom'
import { MdArrowBack, MdGavel } from 'react-icons/md'

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <Link
                    to="/"
                    className="inline-flex items-center mb-6 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                >
                    <MdArrowBack className="mr-2" />
                    Back to Home
                </Link>

                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
                    <div className="flex items-center justify-center mb-6">
                        <MdGavel className="text-purple-600 dark:text-purple-400 mr-3" size={48} />
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Terms of Service</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-center">
                        Last Updated: {new Date().toLocaleDateString()}
                    </p>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6 text-gray-700 dark:text-gray-300">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">1. Acceptance of Terms</h2>
                        <p className="leading-relaxed">
                            By accessing and using the Ambo University Graduate Credential Verification System (AUGCVS), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these Terms of Service, please do not use this service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">2. Use License</h2>
                        <p className="leading-relaxed mb-4">
                            Permission is granted to use AUGCVS for the following purposes:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Verification of graduation credentials</li>
                            <li>Submission of verification requests (for external users)</li>
                            <li>Management of graduate records (for authorized personnel)</li>
                            <li>Processing verification requests (for registrars and admins)</li>
                        </ul>
                        <p className="leading-relaxed mt-4">
                            This license shall automatically terminate if you violate any of these restrictions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">3. User Accounts</h2>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Registration</h3>
                        <p className="leading-relaxed mb-4">
                            To use certain features of AUGCVS, you must register for an account. You agree to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Provide accurate, current, and complete information during registration</li>
                            <li>Maintain and promptly update your account information</li>
                            <li>Maintain the security of your password and account</li>
                            <li>Immediately notify us of any unauthorized use of your account</li>
                            <li>Accept responsibility for all activities under your account</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2 mt-4">User Types</h3>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>External Users:</strong> Can submit and track verification requests</li>
                            <li><strong>Registrars:</strong> Can review and process verification requests</li>
                            <li><strong>Admins:</strong> Have full system access including user and graduate management</li>
                            <li><strong>Superadmins:</strong> Can create internal users and manage all aspects of the system</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">4. Prohibited Uses</h2>
                        <p className="leading-relaxed mb-4">You may not use AUGCVS:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>For any unlawful purpose or to violate any laws</li>
                            <li>To submit false, fraudulent, or misleading information</li>
                            <li>To impersonate or misrepresent your affiliation with any person or entity</li>
                            <li>To upload malicious code or viruses</li>
                            <li>To interfere with or disrupt the service or servers</li>
                            <li>To attempt unauthorized access to any part of the system</li>
                            <li>To collect or harvest personal information of other users</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">5. Intellectual Property</h2>
                        <p className="leading-relaxed">
                            The AUGCVS system, including all content, features, and functionality, is owned by Ambo University and is protected by international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without our express written permission.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">6. Data and Privacy</h2>
                        <p className="leading-relaxed">
                            Your use of AUGCVS is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding the collection and use of your information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">7. Disclaimer of Warranties</h2>
                        <p className="leading-relaxed">
                            AUGCVS is provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not warrant that:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                            <li>The service will be uninterrupted, timely, secure, or error-free</li>
                            <li>The results obtained from the use of the service will be accurate or reliable</li>
                            <li>Any errors in the service will be corrected</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">8. Limitation of Liability</h2>
                        <p className="leading-relaxed">
                            In no event shall Ambo University or its affiliates be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of AUGCVS.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">9. Termination</h2>
                        <p className="leading-relaxed">
                            We reserve the right to terminate or suspend your account and access to AUGCVS immediately, without prior notice or liability, for any reason, including breach of these Terms of Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">10. Changes to Terms</h2>
                        <p className="leading-relaxed">
                            We reserve the right to modify or replace these Terms of Service at any time. We will provide notice of any material changes by posting the new terms on this page and updating the "Last Updated" date. Your continued use of AUGCVS following the posting of changes constitutes acceptance of those changes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">11. Governing Law</h2>
                        <p className="leading-relaxed">
                            These Terms shall be governed and construed in accordance with the laws of the Federal Democratic Republic of Ethiopia, without regard to its conflict of law provisions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">12. Contact Information</h2>
                        <p className="leading-relaxed">
                            If you have any questions about these Terms, please contact us at:
                        </p>
                        <div className="mt-4 p-4 bg-purple-50 dark:bg-gray-700 rounded-lg">
                            <p className="font-semibold">Email: support@augcvs.edu.et</p>
                            <p className="font-semibold">Phone: +251 11 234 5678</p>
                            <p className="font-semibold">Address: Ambo University, Hachalu Hundessa Campus, Ambo, Ethiopia</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default TermsOfService
