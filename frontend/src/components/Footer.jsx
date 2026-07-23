import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="mt-12 bg-gray-900 text-gray-300 rounded-xl overflow-hidden">
      <div className="px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <div className="bg-white inline-block rounded-md p-1.5 mb-3">
            <img src={logo} alt="ELD Trip Planner" className="h-8 w-auto" />
          </div>
          <p className="text-gray-400 text-xs max-w-[220px]">
            HOS-compliant route planning and daily log generation for property-carrying drivers.
          </p>
        </div>

        <div id="assumptions">
          <p className="text-xs text-gray-500 mb-2">Assumptions</p>
          <ul className="flex flex-col gap-1.5 text-xs text-gray-300">
            <li>70hr / 8-day cycle</li>
            <li>No adverse conditions</li>
            <li>Fuel every 1,000 mi</li>
          </ul>
        </div>

        <div id="tech-stack">
          <p className="text-xs text-gray-500 mb-2">Built with</p>
          <ul className="flex flex-col gap-1.5 text-xs text-gray-300">
            <li>Django and DRF</li>
            <li>React and Tailwind</li>
            <li>GraphHopper and OSM</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 px-6 py-3 flex flex-wrap justify-between text-xs text-gray-500">
        <span>© {new Date().getFullYear()} ELD Trip Planner</span>
        <a
          href="https://github.com/Azhaan1560/ELD-Trip-Planner"
          target="_blank"
          rel="noreferrer"
          className="hover:text-gray-300 transition-colors"
        >
          View on GitHub
        </a>
      </div>
    </footer>
  );
}