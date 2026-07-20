import Link from 'next/link';


export default function Header() {
  return (
    <header className="flex justify-between py-3 px-4 lg:py-5 lg:px-30 bg-[#18181B]">
      <div className="flex gap-2 items-center">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3fb950"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
        </svg>
        <div className="flex flex-col">
          <h1 className="text-[13px] lg:text-[20px] font-sf font-bold">SOLAR</h1>
          <span className="text-[10px] lg:text-[15px] font-sf font-normal">Monitoring System</span>
        </div>
        
      </div>

      <nav className="flex gap-2 lg:gap-9 font-sf text-[13px] lg:text-[17px] font-normal items-center">
        <Link href="/">Dashboard</Link>
        <Link href="/developer">Developer</Link>
        <Link href="/logs">Logs</Link>
      </nav>
    </header>
  );
}