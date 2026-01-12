export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200/20 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="text-xl font-semibold text-black">Premium</div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-black transition-colors duration-200 text-sm font-medium"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-black transition-colors duration-200 text-sm font-medium"
              >
                Pricing
              </a>
              <a
                href="#about"
                className="text-gray-600 hover:text-black transition-colors duration-200 text-sm font-medium"
              >
                About
              </a>
              <a
                href="#contact"
                className="text-gray-600 hover:text-black transition-colors duration-200 text-sm font-medium"
              >
                Contact
              </a>
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-900 transition-colors duration-200">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}