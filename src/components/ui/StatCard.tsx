import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  iconColor?: string
  iconBgColor?: string
  className?: string
}

const colorPresets = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-600' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
}

interface StatCardPresetProps {
  icon: LucideIcon
  label: string
  value: string | number
  color?: keyof typeof colorPresets
  className?: string
}

export function StatCard({
  icon: Icon,
  label,
  value,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100',
  className
}: StatCardProps) {
  return (
    <div className={cn(
      'bg-white rounded-lg shadow-sm border border-gray-200 p-6',
      className
    )}>
      <div className="flex items-center">
        <div className={cn('p-2 rounded-lg', iconBgColor)}>
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

export function StatCardPreset({
  icon: Icon,
  label,
  value,
  color = 'blue',
  className
}: StatCardPresetProps) {
  const colors = colorPresets[color]

  return (
    <StatCard
      icon={Icon}
      label={label}
      value={value}
      iconBgColor={colors.bg}
      iconColor={colors.text}
      className={className}
    />
  )
}

interface StatCardCompactProps {
  label: string
  value: string | number
  color?: keyof typeof colorPresets
  className?: string
}

export function StatCardCompact({
  label,
  value,
  color = 'blue',
  className
}: StatCardCompactProps) {
  const colors = colorPresets[color]

  return (
    <div className={cn(
      'rounded-lg p-4 text-center',
      colors.bg,
      className
    )}>
      <div className={cn('text-2xl font-bold', colors.text)}>{value}</div>
      <div className={cn('text-sm', colors.text)}>{label}</div>
    </div>
  )
}
