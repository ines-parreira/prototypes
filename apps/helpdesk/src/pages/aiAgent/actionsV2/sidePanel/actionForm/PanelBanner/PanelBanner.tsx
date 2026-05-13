import type { ReactNode } from 'react'

import classNames from 'classnames'

import { Button, Heading, Icon, Link, Text } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import type { BannerLink, BannerVariant } from '../../types'

import css from './PanelBanner.less'

type Props = {
    variant: BannerVariant
    title?: string
    message: ReactNode
    link?: BannerLink
    isClosable?: boolean
    onClose?: () => void
}

const VARIANT_ICON: Record<BannerVariant, IconName> = {
    info: 'info',
    warning: 'warning-triangle',
    error: 'error-octagon',
}

export const PanelBanner = ({
    variant,
    title,
    message,
    link,
    isClosable = false,
    onClose,
}: Props) => {
    return (
        <div className={classNames(css.banner, css[variant])}>
            <span className={css.iconWrapper} aria-hidden="true">
                <Icon name={VARIANT_ICON[variant]} size="sm" />
            </span>
            <div className={css.body} role="status" aria-live="polite">
                {title && <Heading size="sm">{title}</Heading>}
                <Text size="sm" color="content-neutral-default">
                    {message}
                </Text>
                {link && (
                    <Link
                        size="sm"
                        href={link.href}
                        onClick={link.onClick}
                        target={link.href ? '_blank' : undefined}
                        rel={link.href ? 'noopener noreferrer' : undefined}
                        trailingSlot={link.href ? 'external-link' : undefined}
                    >
                        {link.label}
                    </Link>
                )}
            </div>
            {isClosable && onClose && (
                <span className={css.closeButton}>
                    <Button
                        as="button"
                        variant="tertiary"
                        size="sm"
                        intent="regular"
                        icon="close"
                        aria-label="Dismiss"
                        onClick={onClose}
                    />
                </span>
            )}
        </div>
    )
}
