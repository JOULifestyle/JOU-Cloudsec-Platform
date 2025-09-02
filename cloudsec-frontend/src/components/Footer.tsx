import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 lg:ml-64">
      <div className="py-4 px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
           <div className="mt-2 md:mt-0 flex space-x-6">
             <Link href="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm transition-colors">
               Privacy Policy
             </Link>
             <Link href="/terms-of-service" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm transition-colors">
               Terms of Service
             </Link>
             <Link href="dashboard/contact" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm transition-colors">
               Contact
             </Link>
           </div>
           <div className="text-sm text-gray-500 dark:text-gray-400">
             © {new Date().getFullYear()} JOU CloudSec. All rights reserved.
           </div>
        </div>
      </div>
    </footer>
  );
}