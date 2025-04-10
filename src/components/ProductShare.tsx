'use client';

import { useState } from 'react';

interface ProductShareProps {
  productName: string;
  productUrl: string;
}

export default function ProductShare({ productName, productUrl }: ProductShareProps) {
  const [copied, setCopied] = useState(false);

  const shareLinks = [
    {
      name: 'Facebook',
      icon: 'fab fa-facebook-f',
      color: 'bg-blue-600 hover:bg-blue-700',
      getUrl: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`
    },
    {
      name: 'Twitter',
      icon: 'fab fa-twitter',
      color: 'bg-sky-500 hover:bg-sky-600',
      getUrl: () => `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${productName}`)}&url=${encodeURIComponent(productUrl)}`
    },
    {
      name: 'Pinterest',
      icon: 'fab fa-pinterest-p',
      color: 'bg-red-600 hover:bg-red-700',
      getUrl: () => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(productUrl)}&description=${encodeURIComponent(productName)}`
    },
    {
      name: 'WhatsApp',
      icon: 'fab fa-whatsapp',
      color: 'bg-green-500 hover:bg-green-600',
      getUrl: () => `https://api.whatsapp.com/send?text=${encodeURIComponent(`${productName} - ${productUrl}`)}`
    }
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(productUrl).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };

  return (
    <div className="mt-6">
      <h3 className="font-medium text-gray-700 mb-2">Share this product</h3>
      <div className="flex space-x-2">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.getUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className={`${link.color} text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors`}
            aria-label={`Share on ${link.name}`}
          >
            <i className={link.icon}></i>
          </a>
        ))}
        <button
          onClick={copyToClipboard}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          aria-label="Copy link"
        >
          <i className={copied ? 'fas fa-check' : 'fas fa-link'}></i>
        </button>
      </div>
    </div>
  );
}
