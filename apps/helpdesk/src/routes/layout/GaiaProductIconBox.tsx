import { gaiaProductIconUrl } from 'routes/layout/gaiaProductIcon'

type Props = {
    // Matches the Axiom IconBox variants used elsewhere in the sidebar:
    // `primary` (filled grey, used in the header) and `secondary` (bordered,
    // used in the product dropdown).
    variant?: 'primary' | 'secondary'
    isSelected?: boolean
}

/**
 * Renders the Gaia orb centered inside the same grey square container the
 * Axiom IconBox produces, so the Gaia product icon stays consistent with the
 * other products in the nav.
 */
export function GaiaProductIconBox({
    variant = 'primary',
    isSelected = false,
}: Props) {
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                width: 28,
                height: 28,
                borderRadius: 'var(--spacing-xs)',
                backgroundColor:
                    variant === 'primary'
                        ? 'var(--surface-neutral-secondary)'
                        : 'transparent',
                border:
                    variant === 'secondary'
                        ? `0.5px solid ${
                              isSelected
                                  ? 'var(--border-accent-default)'
                                  : 'var(--border-neutral-default)'
                          }`
                        : 'none',
                boxShadow:
                    variant === 'primary'
                        ? 'inset 1px 2px 3px #0000000f'
                        : 'none',
            }}
        >
            <img
                src={gaiaProductIconUrl}
                alt=""
                style={{
                    display: 'block',
                    width: 16,
                    height: 16,
                    objectFit: 'contain',
                }}
            />
        </span>
    )
}
