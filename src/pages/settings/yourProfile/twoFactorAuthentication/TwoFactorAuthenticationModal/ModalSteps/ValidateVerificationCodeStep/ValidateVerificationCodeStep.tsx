import React, {Dispatch, SetStateAction} from 'react'
import classnames from 'classnames'

import settingsCss from 'pages/settings/settings.less'
import InputField from 'pages/common/forms/input/InputField'
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
            <InputField
                // keeping this as text because if the type is "number"
                // the 0 from 0 leading numbers is removed ( 012345 -> 12345 )
                // and the code becomes invalid
                type="text"
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
