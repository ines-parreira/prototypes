import React, { HTMLAttributes, ReactNode } from 'react'

import {
    Banner,
    BannerFillStyle,
    BannerVariant,
} from '@gorgias/merchant-ui-kit'

import { sanitizeHtmlDefault } from 'utils/html'

import { AlertBannerCTATypes, AlertBannerTypes } from '../types'
import { typeFallbackBanner } from './AlertBanners'
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
