import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-white text-black mt-12">

      {/* Top Bar */}
      <div className="bg-blue-600 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">

          <p className="text-sm">
            Connect with innovators, founders, investors & collaborators.
          </p>

          <div className="flex gap-4 mt-2 md:mt-0">
            <Link to="/social/linkedin" className="hover:text-gray-200">
              LinkedIn
            </Link>

            <Link to="/social/github" className="hover:text-gray-200">
              GitHub
            </Link>

            <Link to="/social/twitter" className="hover:text-gray-200">
              Twitter
            </Link>
          </div>

        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-blue-500 inline-block pb-1">
              InnoConnect
            </h3>

            <p className="text-gray-400 text-sm leading-6">
              Discover innovative ideas, connect with collaborators,
              investors and industry professionals through one platform.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-blue-500 inline-block pb-1">
              Platform
            </h3>

            <div className="flex flex-col gap-3 text-sm">
              <Link to="/projects" className="hover:text-blue-400">
                Explore Projects
              </Link>

              <Link to="/feed" className="hover:text-blue-400">
                Innovation Feed
              </Link>

              <Link to="/network" className="hover:text-blue-400">
                Network
              </Link>

              <Link to="/funding" className="hover:text-blue-400">
                Funding Opportunities
              </Link>

              <Link to="/collaborations" className="hover:text-blue-400">
                Collaborations
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-blue-500 inline-block pb-1">
              Resources
            </h3>

            <div className="flex flex-col gap-3 text-sm">
              <Link to="/about" className="hover:text-blue-400">
                About Us
              </Link>

              <Link to="/privacy-policy" className="hover:text-blue-400">
                Privacy Policy
              </Link>

              <Link to="/terms" className="hover:text-blue-400">
                Terms & Conditions
              </Link>

              <Link to="/help-center" className="hover:text-blue-400">
                Help Center
              </Link>

              <Link to="/contact" className="hover:text-blue-400">
                Contact Us
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-blue-500 inline-block pb-1">
              Contact
            </h3>

            <div className="flex flex-col gap-3 text-sm text-gray-300">
              <span>Mumbai, Maharashtra, India</span>

              <Link to="/contact" className="hover:text-blue-400">
                support@innoconnect.com
              </Link>

              <Link to="/contact" className="hover:text-blue-400">
                +91 98765 43210
              </Link>

              <Link to="/report" className="hover:text-blue-400">
                Report an Issue
              </Link>
            </div>
          </div>

        </div>
      </div>

      <div className="bg-slate-950 text-center py-4 text-sm text-gray-400 border-t border-slate-800">
        © 2026 InnoConnect. All Rights Reserved.
      </div>

    </footer>
  );
}

export default Footer;