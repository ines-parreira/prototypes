import React, {Dispatch, SetStateAction} from 'react'
import classnames from 'classnames'

import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import settingsCss from 'pages/settings/settings.less'
import css from '../ModalSteps.less'

type OwnProps = {
    setVerificationCode: Dispatch<SetStateAction<string>>
    setErrorText: Dispatch<SetStateAction<string>>
}

export default function ValidateVerificationCodeStep({
    setVerificationCode,
    setErrorText,
}: OwnProps) {
    return (
        <>
            <div className={css.headingBold}>Step 3: Verify your code</div>
            <div className={classnames(css.textSection, settingsCss.mb16)}>
                Enter the 6-digit verification code generated from your
                authenticator app.
            </div>
            <DEPRECATED_InputField
                type="number"
                name="verificationCode"
                placeholder="Enter 6-digit verification code from app"
                onChange={(value) => {
                    setVerificationCode(value)
                    setErrorText('')
                }}
            />
        </>
    )
}
