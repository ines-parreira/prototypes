import React from 'react'
import classnames from 'classnames'
import errorIcon from 'assets/img/icons/error.svg'
import infoIcon from 'assets/img/icons/info.svg'
import successIcon from 'assets/img/icons/success.svg'
import css from './ModalBanners.less'

type BannerType = 'info' | 'error' | 'success'

type OwnProps = {
    currentStep: number
    errorText?: string
    initialBannerText?: string | null
    initialBannerType?: BannerType
}

export default function ModalBanners({
    currentStep,
    errorText,
    initialBannerText,
    initialBannerType,
}: OwnProps) {
    const getBanner = (bannerType: BannerType, bannerText: string) => {
        const bannerTypeToClassMapper = {
            info: css.bannerInfo,
            error: css.bannerError,
            success: css.bannerSuccess,
        }

        const bannerTypeToIconMapper = {
            info: infoIcon,
            error: errorIcon,
            success: successIcon,
        }

        return (
            <div
                className={classnames(
                    css.banner,
                    bannerTypeToClassMapper[bannerType]
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
