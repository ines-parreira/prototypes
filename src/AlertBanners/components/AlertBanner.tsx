import type { HTMLAttributes, ReactNode } from 'react'

import {
    Banner,
    BannerFillStyle,
    BannerVariant,
} from '@gorgias/merchant-ui-kit'

import { typeFallbackBanner } from 'AlertBanners/AlertBanner.utils'
import { sanitizeHtmlDefault } from 'utils/html'

import { AlertBannerTypes } from '../types'
import type { AlertBannerCTATypes } from '../types'
import { CTA } from './CTA'

export type AlertBannerProps = {
    'aria-label'?: string
    CTA?: AlertBannerCTATypes
    onClose?: () => void
    isClosable?: boolean
    message: ReactNode | string
    type?: AlertBannerTypes
    suffix?: ReactNode
    variant?: BannerVariant
    fillStyle?: BannerFillStyle
} & Pick<HTMLAttributes<HTMLDivElement>, 'aria-label'>

/**
 * @deprecated This component is being phased out. Please use `<Banner variant="full" />` from `@gorgias/merchant-ui-kit` instead.
 * @date 2024-03-05
 * @type ui-kit-migration
 */
export function AlertBanner({
    'aria-label': ariaLabel,
    message,
    CTA: CTAProps,
    onClose,
    isClosable,
    suffix,
    type = AlertBannerTypes.Info,
    variant = 'full',
    fillStyle = 'fill',
}: AlertBannerProps) {
    return (
        <Banner
            aria-label={ariaLabel ?? ''}
            variant={variant}
            fillStyle={fillStyle}
            onClose={onClose}
            isClosable={isClosable}
            type={typeFallbackBanner(type)}
            suffix={suffix}
            action={CTAProps && <CTA {...CTAProps} />}
        >
            {typeof message === 'string' ? (
                <span
                    dangerouslySetInnerHTML={{
                        __html: sanitizeHtmlDefault(message as string),
                    }}
                />
            ) : (
                <span>{message}</span>
            )}
        </Banner>
    )
}
