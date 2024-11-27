import cn from 'classnames'
import React, {HTMLAttributes, ReactNode} from 'react'

import IconButton from 'pages/common/components/button/IconButton'
import {sanitizeHtmlDefault} from 'utils/html'

import css from './AlertBanner.less'
import {CTA} from './CTA'
import {Icon} from './Icon'
import {AlertBannerTypes, AlertBannerCTATypes} from './types'

export type AlertBannerProps = {
    CTA?: AlertBannerCTATypes
    onClose?: () => void
    message: ReactNode | string
    type?: AlertBannerTypes
    borderless?: boolean
} & Pick<HTMLAttributes<HTMLDivElement>, 'aria-label'>

const AlertBanner = ({
    'aria-label': ariaLabel,
    borderless = false,
    message,
    CTA: CTAProps,
    onClose,
    type = AlertBannerTypes.Info,
}: AlertBannerProps) => {
    return (
        <div
            aria-label={ariaLabel}
            aria-live={
                type === AlertBannerTypes.Critical ? 'assertive' : 'polite'
            }
            className={cn(css.AlertBanner, css[type], {
                [css.borderless]: borderless,
            })}
        >
            <div className={css.centralContainer}>
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

export default AlertBanner
