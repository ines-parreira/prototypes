import React, { ReactNode } from 'react'

import classnames from 'classnames'

import errorIcon from 'assets/img/icons/error.svg'
import infoIcon from 'assets/img/icons/info.svg'
import successIcon from 'assets/img/icons/success.svg'
import warningIcon from 'assets/img/icons/warning2.svg'

import css from './ModalBanners.less'

type BannerType = 'info' | 'warning' | 'error' | 'success'

type OwnProps = {
    currentStep: number
    errorText?: string
    initialBannerText?: ReactNode
    initialBannerType?: BannerType
}

export default function ModalBanners({
    currentStep,
    errorText,
    initialBannerText,
    initialBannerType,
}: OwnProps) {
    const getBanner = (bannerType: BannerType, bannerText: ReactNode) => {
        const bannerTypeToClassMapper = {
            info: css.bannerInfo,
            warning: css.bannerWarning,
            error: css.bannerError,
            success: css.bannerSuccess,
        }

        const bannerTypeToIconMapper = {
            info: infoIcon,
            warning: warningIcon,
            error: errorIcon,
            success: successIcon,
        }

        return (
            <div
                className={classnames(
                    css.banner,
                    bannerTypeToClassMapper[bannerType],
                )}
            >
                <img
                    src={bannerTypeToIconMapper[bannerType]}
                    alt="icon"
                    className={css.icon}
                />
                <div className={css.bannerText}>
                    <span>{bannerText}</span>
                </div>
            </div>
        )
    }

    const getInitialBanner = () => {
        const bannerType = initialBannerType || 'info'
        return initialBannerText ? getBanner(bannerType, initialBannerText) : ''
    }

    return (
        <>
            {currentStep === 1 && getInitialBanner()}
            {currentStep === 3 &&
                getBanner('success', 'Two-factor authentication enabled.')}
            {errorText && getBanner('error', errorText)}
        </>
    )
}
