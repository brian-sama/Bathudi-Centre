
import React from 'react';

const WhatsAppButton: React.FC = () => {
  const phoneNumber = '27689176294';
  const message = 'Hello! I am interested in learning more about your automotive courses.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a 
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[100] group flex items-center space-x-2"
    >
      <span className="bg-slate-900/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
        Chat with us
      </span>
      <div className="w-16 h-16 bg-green-500 rounded-full shadow-2xl shadow-green-500/50 flex items-center justify-center transform transition-transform group-hover:scale-110 active:scale-95 animate-bounce">
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.012l-.582 2.128 2.18-.573c.678.451 1.576.81 2.482.81h.001c3.182 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.769-5.766-5.769zm3.389 8.169c-.144.405-.838.741-1.157.785-.319.044-.739.066-1.157-.088-.261-.096-.544-.223-.831-.353-1.428-.646-2.366-2.093-2.438-2.188-.071-.095-.579-.769-.579-1.467s.357-1.04.501-1.185c.144-.144.31-.223.405-.223.095 0 .19 0 .285.011.096.01.214-.043.333.244.119.287.405.989.44.1.036.075.059.162.012.261-.048.1-.095.144-.144.201s-.119.144-.214.234c-.095.09-.202.19-.083.405.119.214.524.859 1.13 1.4 1.391 1.24 1.391 1.191.144-.144.072-.072.167-.144.261-.214.095-.072.202-.119.333-.072.13.047.832.392.975.464.144.072.238.107.285.19.048.083.048.475-.119.88z" />
        </svg>
      </div>
    </a>
  );
};

export default WhatsAppButton;
