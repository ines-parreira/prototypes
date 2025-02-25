import React, { HTMLAttributes, ReactNode } from 'react'

import cn from 'classnames'

import IconButton from 'pages/common/components/button/IconButton'
import { sanitizeHtmlDefault } from 'utils/html'

import { AlertBannerCTATypes, AlertBannerTypes } from '../types'
import { CTA } from './CTA'
import { Icon } from './Icon'

import css from './AlertBanner.less'

export type AlertBannerProps = {
    CTA?: AlertBannerCTATypes
    onClose?: () => void
    message: ReactNode | string
    type?: AlertBannerTypes
    borderless?: boolean
    prefix?: ReactNode
    textPosition?: 'left' | 'center'
} & Pick<HTMLAttributes<HTMLDivElement>, 'aria-label'>

export function AlertBanner({
    'aria-label': ariaLabel,
    borderless = false,
    message,
    CTA: CTAProps,
    onClose,
    type = AlertBannerTypes.Info,
    prefix,
    textPosition = 'center',
}: AlertBannerProps) {
    return (
        <div
            role="banner"
            aria-label={ariaLabel}
            aria-live={
                type === AlertBannerTypes.Critical ? 'assertive' : 'polite'
            }
            className={cn(css.AlertBanner, css[type], {
                [css.borderless]: borderless,
            })}
        >
            {prefix && <div className={css.prefix}>{prefix}</div>}
            <div
                className={
                    textPosition === 'center'
                        ? css.centralContainer
                        : css.leftContainer
                }
            >
                <Icon type={type} />
                <div className={css.messageContainer}>
                    {typeof message === 'string' ? (
                        <span
                            dangerouslySetInnerHTML={{
                                __html: sanitizeHtmlDefault(message),
                            }}
                        />
                    ) : (
                        <span>{message}</span>
                    )}
                </div>
                {CTAProps && <CTA {...CTAProps} />}
            </div>
            {onClose && (
                <div className={css.closeContainer}>
                    <IconButton
                        fillStyle="ghost"
                        intent="secondary"
                        onClick={() => onClose()}
                    >
                        close
                    </IconButton>
                </div>
            )}
        </div>
    )
}
