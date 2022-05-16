import React, {useCallback, useState} from 'react'
import ToggleInput from 'pages/common/forms/ToggleInput'
import useAppSelector from 'hooks/useAppSelector'
import {has2FaEnabled as has2FaEnabledSelector} from 'state/currentUser/selectors'
import TwoFactorAuthenticationModal from 'pages/settings/yourProfile/twoFactorAuthentication/TwoFactorAuthenticationModal/TwoFactorAuthenticationModal'

type OwnProps = {
    is2FAEnforced: boolean
    loading: boolean
    disabled: boolean

    on2FAEnforced: (val: boolean) => void
}

export default function TwoFactorAuthenticationEnforcement({
    is2FAEnforced,
    loading,
    disabled,
    on2FAEnforced,
}: OwnProps) {
    const [twoFAModalVisible, set2FAModalVisible] = useState(false)
    const has2FAEnabled = useAppSelector(has2FaEnabledSelector)

    const handleToggle = useCallback(
        (value: boolean) => {
            if (value && !has2FAEnabled) {
                set2FAModalVisible(true)
                return
            }

            on2FAEnforced(value)
        },
        [has2FAEnabled, on2FAEnforced]
    )

    return (
        <>
            <div className="mt-5 mb-5">
                <h4 className="mb-2">
                    <i className="material-icons mr-1">lock</i>
                    Two-Factor Authentication (2FA)
                </h4>
                <p>
                    For an added layer of security, you can require your users
                    to use two-factor authentication (2FA) when they sign in to
                    Gorgias.
                </p>
                <ToggleInput
                    name="twoFAEnforcementToggle"
                    isToggled={is2FAEnforced}
                    isLoading={loading || twoFAModalVisible}
                    isDisabled={disabled}
                    onClick={handleToggle}
                >
                    Enforce 2FA for all users
                </ToggleInput>
            </div>
            {twoFAModalVisible && (
                <TwoFactorAuthenticationModal
                    isOpen={twoFAModalVisible}
                    onCancel={() => {
                        set2FAModalVisible(false)
                    }}
                    onFinish={() => {
                        set2FAModalVisible(false)
                        on2FAEnforced(true)
                    }}
                    initialBannerText="Set up two-factor authentication (2FA) for your own account. Once enabled, 2FA will be enforced for all helpdesk users."
                    initialBannerType="info"
                />
            )}
        </>
    )
}
