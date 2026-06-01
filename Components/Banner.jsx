import {
  Info, CheckCircle2, AlertTriangle, AlertOctagon, X
} from 'lucide-react'

const VARIANT_ICON = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertOctagon
}

const VARIANT_LABEL = {
  info: 'Información',
  success: 'Éxito',
  warning: 'Atención',
  error: 'Error'
}

/**
 * Banner — reusable inline notice with 4 variants (info/success/warning/error).
 *
 * Props:
 *   variant   'info' | 'success' | 'warning' | 'error'  (default: 'info')
 *   size      'sm' | 'md' | 'lg'                       (default: 'md')
 *   title     string | ReactNode   optional heading
 *   children  ReactNode            body content (text, list, actions, etc.)
 *   onClose   () => void           optional dismiss button
 *   stripe    boolean              draw left accent border
 *   icon      ReactNode            override the default icon
 *   className string               extra classes
 *   role      'alert' | 'status'   default 'alert' for error/warning, 'status' otherwise
 */
const Banner = ({
  variant = 'info',
  size,
  title,
  children,
  onClose,
  stripe = false,
  icon,
  className = '',
  role,
  ...rest
}) => {
  const Icon = icon || VARIANT_ICON[variant] || Info
  const classes = [
    'banner',
    `banner-${variant}`,
    size ? `banner-${size}` : '',
    stripe ? 'banner-stripe' : '',
    className
  ].filter(Boolean).join(' ')

  const a11yRole = role || (variant === 'error' || variant === 'warning' ? 'alert' : 'status')

  return (
    <div className={classes} role={a11yRole} {...rest}>
      <span className="banner-ic" aria-hidden="true">
        <Icon size={16} />
      </span>
      <div className="banner-body">
        {title && <p className="banner-title">{title}</p>}
        {children && (
          typeof children === 'string'
            ? <p className="banner-text">{children}</p>
            : children
        )}
      </div>
      {onClose && (
        <button
          type="button"
          className="banner-close"
          onClick={onClose}
          aria-label="Cerrar aviso"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}

export { VARIANT_LABEL }
export default Banner
