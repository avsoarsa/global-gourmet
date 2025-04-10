'use client';

import Link from 'next/link';
import { FaSeedling, FaCheckCircle } from 'react-icons/fa';

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center text-amber-600">
            <FaSeedling className="text-3xl" />
            <span className="ml-2 text-2xl font-bold text-gray-800">Global Gourmet</span>
          </Link>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <div className="text-green-500 mb-4">
            <FaCheckCircle className="mx-auto text-5xl" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Account Created Successfully!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Thank you for creating an account with Global Gourmet. You can now sign in to access your account.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/auth/signin"
              className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium"
            >
              Sign In
            </Link>
            
            <Link
              href="/"
              className="border border-amber-600 text-amber-600 px-6 py-3 rounded-md hover:bg-amber-50 font-medium"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
