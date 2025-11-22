import React from 'react'
import { Link } from 'react-router-dom'
import { MdArrowBack, MdPrivacyTip } from 'react-icons/md'

const PrivacyPolicy = () => {
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
                        <MdPrivacyTip className="text-purple-600 dark:text-purple-400 mr-3" size={48} />
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Privacy Policy</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-center">
                        Last Updated: {new Date().toLocaleDateString()}
                    </p>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6 text-gray-700 dark:text-gray-300">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">1. Introduction</h2>
                        <p className="leading-relaxed">
                            Welcome to the Ambo University Graduate Credential Verification System (AUGCVS). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our system.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">2. Information We Collect</h2>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Personal Information</h3>
                        <p className="leading-relaxed mb-4">
                            When you register or use our services, we may collect the following information:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Full name</li>
                            <li>Email address</li>
                            <li>Organization affiliation</li>
                            <li>User role (Admin, Registrar, External User)</li>
                            <li>Account credentials (encrypted)</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2 mt-4">Graduate Information</h3>
                        <p className="leading-relaxed mb-4">
                            For verification purposes, we store graduate records including:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Graduate's full name</li>
                            <li>Student ID</li>
                            <li>Degree and program information</li>
                            <li>Graduation date</li>
                            <li>Academic certificates (uploaded files)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">3. How We Use Your Information</h2>
                        <p className="leading-relaxed mb-4">We use the information we collect to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Provide, operate, and maintain our credential verification service</li>
                            <li>Process verification requests</li>
                            <li>Send administrative information and notifications</li>
                            <li>Improve and develop our services</li>
                            <li>Enforce our Terms of Service</li>
                            <li>Maintain security and prevent fraud</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">4. Data Security</h2>
                        <p className="leading-relaxed">
                            We implement appropriate technical and organizational security measures to protect your personal information, including:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                            <li>Encrypted password storage using bcryptjs</li>
                            <li>JWT-based authentication</li>
                            <li>Role-based access control (RBAC)</li>
                            <li>Secure HTTPS connections</li>
                            <li>Regular security audits</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">5. Data Sharing and Disclosure</h2>
                        <p className="leading-relaxed">
                            We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                            <li>With authorized university personnel for verification purposes</li>
                            <li>When required by law or legal process</li>
                            <li>To protect our rights and safety</li>
                            <li>With your explicit consent</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">6. Your Rights</h2>
                        <p className="leading-relaxed mb-4">You have the right to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Access your personal information</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your account (subject to legal obligations)</li>
                            <li>Withdraw consent for data processing</li>
                            <li>Lodge a complaint with relevant authorities</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">7. Data Retention</h2>
                        <p className="leading-relaxed">
                            We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Graduate records are retained permanently for verification purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">8. Updates to This Policy</h2>
                        <p className="leading-relaxed">
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">9. Contact Us</h2>
                        <p className="leading-relaxed">
                            If you have questions or concerns about this Privacy Policy, please contact us at:
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

export default PrivacyPolicy
