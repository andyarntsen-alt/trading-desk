export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-black mb-8 leading-tight">
          Build something
          <span className="block text-gray-600">extraordinary</span>
        </h1>

        {/* Subtext */}
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Create premium experiences that users love. Clean design, powerful features, and attention to every detail.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Start Building
          </button>
          <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-50 transition-all duration-200">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}