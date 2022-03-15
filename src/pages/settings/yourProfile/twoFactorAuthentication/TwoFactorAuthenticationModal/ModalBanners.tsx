import React from 'react'
import classnames from 'classnames'
import errorIcon from 'assets/img/icons/error.svg'
import infoIcon from '../../../../../assets/img/icons/info.svg'
import successIcon from '../../../../../assets/img/icons/success.svg'
import css from './ModalBanners.less'

type OwnProps = {
    currentStep: number
    errorText: string
    isEnforced: boolean
}

export default function ModalBanners({
    currentStep,
    errorText,
    isEnforced,
}: OwnProps) {
    return (
        <>
            {currentStep === 1 && isEnforced && (
                <div className={classnames(css.banner, css.bannerInfo)}>
                    <img src={infoIcon} alt="icon" className={css.icon} />
                    <div className={css.bannerText}>
                        <span>
                            For security reasons, your admin requires you to
                            setup two-factor authentication in order to access
                            your account.
                        </span>
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
