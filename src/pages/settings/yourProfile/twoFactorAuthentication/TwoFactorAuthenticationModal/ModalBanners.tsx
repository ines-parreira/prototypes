import React from 'react'
import classnames from 'classnames'
import errorIcon from 'assets/img/icons/error.svg'
import infoIcon from '../../../../../assets/img/icons/info.svg'
import successIcon from '../../../../../assets/img/icons/success.svg'
import css from './ModalBanners.less'

type OwnProps = {
    currentStep: number
    errorText?: string
    initialBannerInfoText?: string
}

export default function ModalBanners({
    currentStep,
    errorText,
    initialBannerInfoText,
}: OwnProps) {
    return (
        <>
            {currentStep === 1 && initialBannerInfoText && (
                <div className={classnames(css.banner, css.bannerInfo)}>
                    <img src={infoIcon} alt="icon" className={css.icon} />
                    <div className={css.bannerText}>
                        <span>{initialBannerInfoText}</span>
                    </div>
                </div>
            )}
            {currentStep === 3 && (
                <div className={classnames(css.banner, css.bannerSuccess)}>
                    <img src={successIcon} alt="icon" className={css.icon} />
                    <div className={css.bannerText}>
                        <span>Two-factor authentication enabled.</span>
                    </div>
                </div>
            )}
            {errorText && (
                <div className={classnames(css.banner, css.bannerError)}>
                    <img src={errorIcon} alt="icon" className={css.icon} />
                    <div className={css.bannerText}>
                        <span>{errorText}</span>
                    </div>
                </div>
            )}
        </>
    )
}
