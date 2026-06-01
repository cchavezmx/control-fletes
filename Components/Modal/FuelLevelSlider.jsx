import { Fuel } from 'lucide-react'

const FuelLevelSlider = ({ value = 50, onChange }) => {
  const numericValue = Number(value) || 0

  const fuelColor =
    numericValue > 60 ? '#1f9d57'
      : numericValue > 25 ? '#c98a13'
        : '#cf3d3d'

  const label =
    numericValue <= 20 ? 'Crítico'
      : numericValue <= 50 ? 'Medio'
        : 'Alto'

  return (
    <div className="fuel-slider-wrap">
      <div className="fuel-slider-track-row">
        <Fuel size={18} style={{ color: fuelColor, flexShrink: 0 }} />
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={numericValue}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            background: `linear-gradient(90deg, ${fuelColor} ${numericValue}%, var(--line) ${numericValue}%)`,
            // Update thumb border color dynamically via CSS custom property
            '--thumb-border': fuelColor
          }}
          className="fuel-slider-dynamic"
        />
        <span className="fuel-readout tnum" style={{ color: fuelColor }}>
          {numericValue}%
        </span>
      </div>
    </div>
  )
}

export default FuelLevelSlider
