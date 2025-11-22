import React from 'react'
import { Link } from 'react-router-dom'
import { MdArrowBack, MdSupportAgent, MdEmail, MdPhone, MdLocationOn, MdHelp } from 'react-icons/md'

const Support = () => {
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
                        <MdSupportAgent className="text-purple-600 dark:text-purple-400 mr-3" size={48} />
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Support Center</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-center text-lg">
                        We're here to help! Get in touch with us for any questions or assistance.
                    </p>
                </div>

                {/* Contact Methods */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                <MdEmail className="text-purple-600 dark:text-purple-400" size={32} />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Email Us</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-3">Send us an email anytime</p>
                        <a
                            href="mailto:support@augcvs.edu.et"
                            className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                        >
                            support@augcvs.edu.et
                        </a>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                <MdPhone className="text-purple-600 dark:text-purple-400" size={32} />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Call Us</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-3">Mon-Fri, 8AM-5PM EAT</p>
                        <a
                            href="tel:+251112345678"
                            className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                        >
                            +251 11 234 5678
                        </a>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                <MdLocationOn className="text-purple-600 dark:text-purple-400" size={32} />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Visit Us</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Ambo University<br />
                            Hachalu Hundessa Campus<br />
                            Ambo, Ethiopia
                        </p>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
                    <div className="flex items-center mb-6">
                        <MdHelp className="text-purple-600 dark:text-purple-400 mr-3" size={32} />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Frequently Asked Questions</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                                How do I verify a graduate's credentials?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Register as an external user, log in to your account, and submit a verification request with the graduate's information. Our registrars will review and process your request.
                            </p>
                        </div>

                        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                                How long does verification take?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Verification requests are typically processed within 3-5 business days. You'll receive an email notification once your request has been reviewed.
                            </p>
                        </div>

                        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                                I forgot my password. How do I reset it?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Click on "Forgot Password" on the login page, enter your email address, and follow the instructions sent to your email to reset your password.
                            </p>
                        </div>

                        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                                Who can register for an account?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Public registration is available for external users (employers, institutions, etc.). Admin and registrar accounts are created by superadmins for authorized university personnel only.
                            </p>
                        </div>

                        <div className="pb-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                                Is my data secure?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Yes. We use industry-standard security measures including encrypted passwords, JWT authentication, role-based access control, and HTTPS connections to protect your data.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Additional Resources */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Additional Resources</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Link
                            to="/about"
                            className="flex items-center p-4 bg-purple-50 dark:bg-gray-700 rounded-lg hover:bg-purple-100 dark:hover:bg-gray-600 transition-colors"
                        >
                            <span className="text-purple-600 dark:text-purple-400 font-medium">About AUGCVS</span>
                        </Link>
                        <Link
                            to="/privacy-policy"
                            className="flex items-center p-4 bg-purple-50 dark:bg-gray-700 rounded-lg hover:bg-purple-100 dark:hover:bg-gray-600 transition-colors"
                        >
                            <span className="text-purple-600 dark:text-purple-400 font-medium">Privacy Policy</span>
                        </Link>
                        <Link
                            to="/terms-of-service"
                            className="flex items-center p-4 bg-purple-50 dark:bg-gray-700 rounded-lg hover:bg-purple-100 dark:hover:bg-gray-600 transition-colors"
                        >
                            <span className="text-purple-600 dark:text-purple-400 font-medium">Terms of Service</span>
                        </Link>
                        <a
                            href="https://github.com/Yakob-B/AUGCVS"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-4 bg-purple-50 dark:bg-gray-700 rounded-lg hover:bg-purple-100 dark:hover:bg-gray-600 transition-colors"
                        >
                            <span className="text-purple-600 dark:text-purple-400 font-medium">View on GitHub</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Support
