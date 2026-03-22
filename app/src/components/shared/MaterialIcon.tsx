interface MaterialIconProps {
  icon: string
  filled?: boolean
  className?: string
  size?: string
}

export function MaterialIcon({ icon, filled, className = '', size }: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: filled ? "'FILL' 1" : undefined,
        fontSize: size,
      }}
    >
      {icon}
    </span>
  )
}
