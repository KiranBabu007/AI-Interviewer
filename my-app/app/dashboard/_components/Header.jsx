import { UserButton } from "@clerk/nextjs"
import Image from "next/image"


const Header = () => {
  return (
    <div className="flex p-4 items-center justify-between bg-secondary shadow-md font-sans">
        
      <Image src={'/logo.svg'} width={80} height={80} />
      <ul className="flex gap-6">
        <li className=" hover:text-blue-900 hover:font-bold transition-all">Dashboard</li>
        <li className=" hover:text-blue-900 hover:font-bold transition-all">HR Interview</li>
        <li className=" hover:text-blue-900 hover:font-bold transition-all">Technical Interview</li>
        <li className=" hover:text-blue-900 hover:font-bold transition-all">Report</li>
      </ul>
      <UserButton/>
    </div>
  )
}

export default Header
