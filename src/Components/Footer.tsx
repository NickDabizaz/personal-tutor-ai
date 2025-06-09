export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between gap-8">
        <div className="animate-fade-in">
          <h3 className="text-xl font-bold text-white mb-2">Course AI</h3>            <p className="text-sm max-w-xs">
            Smarter, faster learning powered by AI and designed for humans.
          </p>
        </div>
        <nav className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
          <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <h4 className="text-white font-semibold mb-1">Product</h4>
            <ul className="space-y-1">
              <li>
                <a href="#features" className="hover:text-white transition-colors duration-300">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors duration-300">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors duration-300">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h4 className="text-white font-semibold mb-1">Company</h4>
            <ul className="space-y-1">
              <li>
                <a href="#" className="hover:text-white transition-colors duration-300">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-300">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-300">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
            <h4 className="text-white font-semibold mb-1">Legal</h4>
            <ul className="space-y-1">
              <li>
                <a href="#" className="hover:text-white transition-colors duration-300">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-300">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
      <p className="mt-12 text-center text-xs text-gray-600 animate-fade-in" style={{ animationDelay: "400ms" }}>
        © {new Date().getFullYear()} Course AI. All rights reserved.
      </p>
    </footer>
  );
}