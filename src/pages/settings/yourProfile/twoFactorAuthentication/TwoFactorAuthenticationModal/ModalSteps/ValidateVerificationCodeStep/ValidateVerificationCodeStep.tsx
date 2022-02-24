import React, {Dispatch, SetStateAction} from 'react'
import classnames from 'classnames'

import css from '../ModalSteps.less'
import settingsCss from '../../../../../settings.less'
import InputField from '../../../../../../common/forms/InputField'

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
