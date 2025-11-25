import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/10 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-paper border border-ink/5 shadow-soft w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] relative z-10 rounded-xl"
          >
            <div className="flex items-center justify-between p-6 md:p-8 pb-4">
              <h2 className="font-serif font-bold text-2xl text-ink">{title}</h2>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-ink/5 rounded-full transition-colors text-ink-light hover:text-ink"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            <div className="p-6 md:p-8 pt-2 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};