import logo from "../assets/logo.png";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-white border-b flex items-center justify-between gap-4 py-2 px-1 flex-wrap">
      <img src={logo} alt="ELD Trip Planner" className="h-12 w-auto" />

      <nav className="flex items-center gap-6 text-sm text-gray-500">
        <a href="#assumptions" className="hover:text-gray-800">Assumptions</a>
        <a href="#tech-stack" className="hover:text-gray-800">Tech stack</a>
      </nav>

      <a
        href="https://github.com/Azhaan1560/ELD-Trip-Planner"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-sm border rounded-lg px-3 py-1.5 hover:bg-gray-50"
      >
        View on GitHub
      </a>
    </header>
  );
}