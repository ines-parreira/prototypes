import type { Dispatch, SetStateAction } from 'react'
import React from 'react'

import classnames from 'classnames'

import InputField from 'pages/common/forms/input/InputField'
import settingsCss from 'pages/settings/settings.less'

import css from '../ModalSteps.less'

type OwnProps = {
    setVerificationCode: Dispatch<SetStateAction<string>>
    setErrorText: Dispatch<SetStateAction<string>>
    isUpdate?: boolean
}

export default function ValidateVerificationCodeStep({
    setVerificationCode,
    setErrorText,
    isUpdate,
}: OwnProps) {
    return (
        <>
            <div className={css.headingBold}>
                {!isUpdate && 'Step 3: '}
                Verify your code
            </div>

            <div className={classnames(css.textSection, settingsCss.mb16)}>
                Enter a verification code from your authenticator app or a
                recovery code
            </div>
            <InputField
                // keeping this as text because if the type is "number"
                // the 0 from 0 leading numbers is removed ( 012345 -> 12345 )
                // and the code becomes invalid
                type="text"
                name="verificationCode"
                placeholder="Enter 6-digit verification code from app or recovery code"
                onChange={(value) => {
                    setVerificationCode(value)
                    setErrorText('')
                }}
            />
        </>
    )
}
