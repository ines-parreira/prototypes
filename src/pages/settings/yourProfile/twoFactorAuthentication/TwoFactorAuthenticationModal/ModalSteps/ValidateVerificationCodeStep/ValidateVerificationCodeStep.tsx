import React, {Dispatch, SetStateAction} from 'react'
import classnames from 'classnames'

import settingsCss from 'pages/settings/settings.less'
import InputField from 'pages/common/forms/input/InputField'
import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import css from '../ModalSteps.less'

type OwnProps = {
    setVerificationCode: Dispatch<SetStateAction<string>>
    setUserPassword: Dispatch<SetStateAction<string>>
    setErrorText: Dispatch<SetStateAction<string>>
    hasPassword?: boolean
    isUpdate?: boolean
}

export default function ValidateVerificationCodeStep({
    setVerificationCode,
    hasPassword = false,
    setUserPassword,
    setErrorText,
    isUpdate,
}: OwnProps) {
    const requireRecentLogin = useFlag(
        FeatureFlagKey.Setup2FAWithRecentLoginInsteadOfPassword,
        false
    )

    return (
        <>
            <div className={css.headingBold}>
                {!isUpdate && 'Step 3: '}
                Verify your code
            </div>

            {hasPassword && !requireRecentLogin && (
                <>
                    <div
                        className={classnames(
                            css.textSection,
                            settingsCss.mb16
                        )}
                    >
                        Enter your password.
                    </div>
                    <InputField
                        type="password"
                        name="userPassword"
                        placeholder="Enter your password"
                        onChange={(value) => {
                            setUserPassword(value)
                            setErrorText('')
                        }}
                    />
                </>
            )}

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
