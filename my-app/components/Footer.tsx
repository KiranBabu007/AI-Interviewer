import { Facebook, Github, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-200 to-gray-100 text-black py-6 shadow-lg">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
        {/* Brand & Copyright */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-semibold tracking-wide">AI Interviewer</h2>
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>

        {/* Social Icons */}
        <div className="flex space-x-5 mt-4 md:mt-0">
          <a
            href="#"
            className="text-gray-600 transition duration-300 hover:text-gray-300 hover:shadow-[0_0_10px_rgba(192,192,192,0.7)]"
          >
            <Github className="w-5 h-5" />
          </a>
          <a
            href="#"
            className="text-gray-600 transition duration-300 hover:text-gray-300 hover:shadow-[0_0_10px_rgba(192,192,192,0.7)]"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a
            href="#"
            className="text-gray-600 transition duration-300 hover:text-gray-300 hover:shadow-[0_0_10px_rgba(192,192,192,0.7)]"
          >
            <Linkedin className="w-5 h-5" />
          </a>
          <a
            href="#"
            className="text-gray-600 transition duration-300 hover:text-gray-300 hover:shadow-[0_0_10px_rgba(192,192,192,0.7)]"
          >
            <Facebook className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}