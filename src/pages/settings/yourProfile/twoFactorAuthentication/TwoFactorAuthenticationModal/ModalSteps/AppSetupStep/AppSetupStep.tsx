import React from 'react'
import classnames from 'classnames'

import authenticatorImage from 'assets/img/auth/2fa-code.svg'
import settingsCss from 'pages/settings/settings.less'
import css from '../ModalSteps.less'

export default function AppSetupStep() {
    return (
        <>
            <div className={css.headingBold}>Have your mobile device ready</div>

            <div className={classnames(css.textSection, settingsCss.mb16)}>
                Download any authenticator app to your mobile device. Possible
                options are{' '}
                <a
                    href="https://support.google.com/accounts/answer/1066447"
                    target="_blank"
                    rel="noreferrer"
                >
                    Google Authenticator
                </a>
                ,{' '}
                <a
                    href="https://www.microsoft.com/en-us/security/mobile-authenticator-app"
                    target="_blank"
                    rel="noreferrer"
                >
                    Microsoft Authenticator
                </a>
                ,{' '}
                <a href="https://authy.com/" target="_blank" rel="noreferrer">
                    Authy
                </a>
                , or{' '}
                <a
                    href="https://duo.com/product/multi-factor-authentication-mfa/duo-mobile-app"
                    target="_blank"
                    rel="noreferrer"
                >
                    Duo
                </a>
                .
            </div>

            <div className={css.stepImage}>
                <img src={authenticatorImage} alt="" />
            </div>
        </>
    )
}
