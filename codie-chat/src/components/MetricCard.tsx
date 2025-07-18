import type { IconType } from 'react-icons';

type Props = {
  title: string;
  value: string;
  Icon: IconType;
  color: 'green' | 'blue' | 'red';
};

export default function MetricCard({ title, value, Icon, color }: Props) {
  const colorMap: Record<string, string> = {
    green: 'text-green-400',
    blue: 'text-blue-400',
    red: 'text-red-400',
  };

  return (
    <div className="p-4 rounded-xl bg-gray-800/50 backdrop-blur-lg border border-gray-700 shadow-md flex items-center gap-4">
      <div className={`text-3xl ${colorMap[color]}`}>
        <Icon />
      </div>
      <div>
        <h3 className="text-sm text-gray-400 uppercase">{title}</h3>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}