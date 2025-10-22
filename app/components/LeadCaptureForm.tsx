// components/LeadCaptureForm.tsx
'use client';
import { useState, FormEvent } from 'react';
import { LeadFormData } from '@/my-fixed-project/types';

interface LeadCaptureFormProps {
  onLeadCaptured?: (leadData: LeadFormData) => void;
}

export default function LeadCaptureForm({ onLeadCaptured }: LeadCaptureFormProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    goal: '',
    experience: 'beginner'
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      onLeadCaptured?.(formData);
      setIsOpen(false);
      setFormData({ name: '', email: '', goal: '', experience: 'beginner' });
      
      alert('Thanks! The trainer will contact you within 24 hours!');
    } catch (error) {
      console.error('Error submitting lead:', error);
      alert('There was an error submitting your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        type="button"
      >
        Get Free Consultation
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Book Your Free Session</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="goal" className="block text-sm font-medium mb-1">
                  Main Goal
                </label>
                <select
                  id="goal"
                  name="goal"
                  required
                  value={formData.goal}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select your goal</option>
                  <option value="weight-loss">Weight Loss</option>
                  <option value="muscle-gain">Muscle Building</option>
                  <option value="strength">Strength Training</option>
                  <option value="toning">Toning & Definition</option>
                  <option value="endurance">Endurance</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 py-2 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 rounded-md transition-colors"
                >
                  {isSubmitting ? 'Booking...' : 'Book Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}