"use client";

import { useState, useRef, useEffect } from "react";
import { LucideX } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
  index: number;
}

const FAQCard = ({ question, answer, index }: FAQItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = () => {
    if (!isExpanded) {
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
      setIsExpanded(true);
    }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Restore body scrolling
    document.body.style.overflow = '';
    setIsExpanded(false);
  };

  // Determine card color based on index
  const getCardColor = () => {
    const colors = [
      'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30',
      'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/30',
      'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/30',
      'bg-pink-50 dark:bg-pink-900/20 border-pink-100 dark:border-pink-800/30',
      'bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-800/30',
      'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30',
    ];
    return colors[index % colors.length];
  };

  // Determine badge color based on index
  const getBadgeColor = () => {
    const colors = [
      'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
      'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300',
      'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300',
      'bg-pink-100 dark:bg-pink-900/40 text-pink-800 dark:text-pink-300',
      'bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300',
      'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
    ];
    return colors[index % colors.length];
  };

  return (
    <>
      {/* Card */}
      <div
        className={`h-full min-h-[180px] cursor-pointer rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md ${getCardColor()}`}
        onClick={handleCardClick}
      >
        <div className="flex h-full flex-col justify-between p-6">
          <div>
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getBadgeColor()}`}>
              Question {index + 1}
            </span>
            <h3 className="mt-3 text-xl font-bold text-gray-900 dark:text-white">{question}</h3>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Click to view answer</p>
        </div>
      </div>

      {/* Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleCloseClick}
          ></div>

          <div
            className="relative max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseClick}
              className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-100"
            >
              <LucideX className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getBadgeColor()}`}>
                Question {index + 1}
              </span>
              <h3 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{question}</h3>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <div className="text-base leading-relaxed text-gray-600 dark:text-gray-300">{answer}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default function FAQPage() {
  const faqItems = [
    {
      question: "What is PG Management System?",
      answer: (
        <p>
          PG Management System is a comprehensive platform designed to streamline the management of Paying Guest accommodations.
          It helps property owners manage their properties, rooms, tenants, and payments efficiently while providing tenants
          with an easy way to view their information and make payments.
        </p>
      ),
    },
    {
      question: "How do I make a payment?",
      answer: (
        <div className="space-y-3">
          <p>Making a payment is simple:</p>
          <ol className="list-decimal space-y-2 pl-8">
            <li className="pl-2">Go to the Payments page</li>
            <li className="pl-2">Click on "Make Payment" button</li>
            <li className="pl-2">Scan the QR code using any UPI app</li>
            <li className="pl-2">Complete the payment in your UPI app</li>
            <li className="pl-2">Return to the PG Management System and click "I've Made the Payment"</li>
            <li className="pl-2">Your payment will be marked as "Waiting for Approval"</li>
            <li className="pl-2">Once the admin approves your payment, it will be marked as "Paid"</li>
          </ol>
        </div>
      ),
    },
    {
      question: "What are the different payment statuses?",
      answer: (
        <div className="space-y-3">
          <p>Payments can have the following statuses:</p>
          <ul className="list-disc space-y-2 pl-8">
            <li className="pl-2"><span className="font-medium">Pending</span>: Payment is due but not yet made</li>
            <li className="pl-2"><span className="font-medium">Waiting Approval</span>: Payment has been made but is waiting for admin verification</li>
            <li className="pl-2"><span className="font-medium">Paid</span>: Payment has been verified and approved by the admin</li>
            <li className="pl-2"><span className="font-medium">Failed</span>: Payment was declined by the admin or failed to process</li>
          </ul>
        </div>
      ),
    },
    {
      question: "How do I view my room details?",
      answer: (
        <p>
          As a tenant, you can view your room details on your Dashboard. The dashboard displays your room number,
          room type, monthly rent, and property information. If you need more detailed information about your room,
          please contact the property administrator.
        </p>
      ),
    },
    {
      question: "How do admins approve payments?",
      answer: (
        <div className="space-y-3">
          <p>Admins can approve payments through the following steps:</p>
          <ol className="list-decimal space-y-2 pl-8">
            <li className="pl-2">Log in with admin credentials</li>
            <li className="pl-2">Navigate to the Payments page</li>
            <li className="pl-2">Find payments with "Waiting Approval" status</li>
            <li className="pl-2">Click the "Approve" button to mark the payment as "Paid"</li>
            <li className="pl-2">Alternatively, click "Decline" if the payment cannot be verified</li>
          </ol>
        </div>
      ),
    },
    {
      question: "What's the difference between admin and regular user accounts?",
      answer: (
        <div className="space-y-3">
          <p><strong>Admin accounts</strong> have access to:</p>
          <ul className="list-disc space-y-2 pl-8">
            <li className="pl-2">Dashboard with overall statistics</li>
            <li className="pl-2">Tenant management</li>
            <li className="pl-2">Room management</li>
            <li className="pl-2">Property management</li>
            <li className="pl-2">Payment approval system</li>
            <li className="pl-2">Settings</li>
          </ul>
          <p className="mt-3"><strong>Regular user accounts</strong> have access to:</p>
          <ul className="list-disc space-y-2 pl-8">
            <li className="pl-2">Personal dashboard with their information</li>
            <li className="pl-2">Payment system to make and track payments</li>
            <li className="pl-2">Settings to update their profile</li>
          </ul>
        </div>
      ),
    },
    {
      question: "How secure is the payment system?",
      answer: (
        <p>
          Our payment system uses QR codes that link to UPI payment apps. The actual payment processing happens through
          your trusted UPI app (like Google Pay, PhonePe, Paytm, etc.). Once you complete the payment, you mark it as paid
          in our system, and the property admin verifies and approves it. This system ensures security while maintaining
          simplicity and avoiding the complexity of direct payment gateway integration.
        </p>
      ),
    },
    {
      question: "Can I see my payment history?",
      answer: (
        <p>
          Yes, you can view your complete payment history on the Payments page. This includes all your past payments
          with their status, amount, payment type, and date. You can also filter and search through your payment history
          to find specific transactions.
        </p>
      ),
    },
    {
      question: "How do I update my personal information?",
      answer: (
        <p>
          You can update your personal information through the Settings page. This includes your name, email, and password.
          For changes to your tenancy details like room assignment or rent amount, please contact your property administrator.
        </p>
      ),
    },
    {
      question: "What should I do if I have technical issues?",
      answer: (
        <p>
          If you encounter any technical issues while using the PG Management System, please try refreshing the page first.
          If the problem persists, contact your property administrator or the system support team with details about the issue
          you're experiencing.
        </p>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Find answers to common questions about using the PG Management System
        </p>
      </div>

      <div className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {faqItems.map((item, index) => (
          <FAQCard
            key={index}
            question={item.question}
            answer={item.answer}
            index={index}
          />
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-indigo-50 p-8 shadow-sm dark:bg-indigo-900/20">
        <h2 className="text-xl font-medium text-indigo-800 dark:text-indigo-300">Still have questions?</h2>
        <p className="mt-3 text-base text-indigo-700 dark:text-indigo-400">
          If you couldn't find the answer to your question, please contact your property administrator for assistance.
        </p>
      </div>
    </div>
  );
}
