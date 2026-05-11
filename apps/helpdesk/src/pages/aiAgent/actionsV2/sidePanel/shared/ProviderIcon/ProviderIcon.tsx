import classNames from 'classnames'

import css from './ProviderIcon.less'

export type ProviderIconSize = 'sm' | 'md'
export type ProviderIconVariant = 'tile' | 'plain'

type Props = {
    iconUrl: string
    alt?: string
    size?: ProviderIconSize
    variant?: ProviderIconVariant
    className?: string
}

export const ProviderIcon = ({
    iconUrl,
    alt,
    size = 'md',
    variant = 'tile',
    className,
}: Props) => {
    const isDecorative = !alt
    return (
        <span
            className={classNames(
                css.wrapper,
                size === 'sm' && css.sm,
                variant === 'plain' && css.plain,
                className,
            )}
        >
            <img
                alt={alt ?? ''}
                aria-hidden={isDecorative || undefined}
                role={isDecorative ? 'presentation' : undefined}
                className={css.icon}
                src={iconUrl}
            />
        </span>
    )
}
