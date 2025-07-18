import { FaCogs, FaShieldAlt, FaBug } from 'react-icons/fa';

export default function Sidebar() {
  return (
    <aside className="w-20 bg-gray-800/50 backdrop-blur-lg border-r border-gray-700 flex flex-col items-center py-6 space-y-8">
      <FaCogs className="text-white text-2xl hover:text-blue-500 cursor-pointer" />
      <FaShieldAlt className="text-white text-2xl hover:text-blue-500 cursor-pointer" />
      <FaBug className="text-white text-2xl hover:text-blue-500 cursor-pointer" />
    </aside>
  );
}