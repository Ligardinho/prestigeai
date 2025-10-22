// app/page.tsx
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Your website content */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Professional Fitness Training
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Transform your body and mind with personalized training programs designed for your goals.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="font-bold text-lg mb-3">Personal Training</h3>
              <p className="text-gray-600">1-on-1 sessions tailored to your specific goals and needs.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="font-bold text-lg mb-3">Group Classes</h3>
              <p className="text-gray-600">Dynamic group sessions that keep you motivated and engaged.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="font-bold text-lg mb-3">Online Coaching</h3>
              <p className="text-gray-600">Professional guidance from anywhere in the world.</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-500 text-sm">
              💬 Have questions? Click the chat icon in the bottom right to talk with our AI assistant!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}