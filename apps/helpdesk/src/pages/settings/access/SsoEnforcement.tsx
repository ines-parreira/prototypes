import { useCallback, useState } from 'react'

import { UserRole } from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import ToggleInput from 'pages/common/forms/ToggleInput'
import { getCurrentUser } from 'state/currentUser/selectors'

import { ConfirmationModal } from '../helpCenter/components/ConfirmationModal'

type OwnProps = {
    ssoEnforcedDatetime: string | null
    loading: boolean
    disabled: boolean
    googleSsoEnabled: boolean
    office365SsoEnabled: boolean
    hasCustomSsoProviders: boolean
    onSsoEnforced: (val: string | null) => void
}

export default function SsoEnforcement({
    ssoEnforcedDatetime,
    loading,
    disabled,
    googleSsoEnabled,
    office365SsoEnabled,
    hasCustomSsoProviders,
    onSsoEnforced,
}: OwnProps) {
    const [confirmModalVisible, setConfirmModalVisible] = useState(false)

    const isSsoEnforced = !!ssoEnforcedDatetime
    const hasAnySsoProvider =
        googleSsoEnabled || office365SsoEnabled || hasCustomSsoProviders

    const currentUser = useAppSelector(getCurrentUser)
    const isGorgiasAgent =
        currentUser.getIn(['role', 'name']) === UserRole.GorgiasAgent
    const isDisabled = isGorgiasAgent || disabled

    const setSsoEnforced = useCallback(() => {
        const isoString = new Date().toISOString().split('.')[0]
        onSsoEnforced(isoString)
    }, [onSsoEnforced])

    const handleToggle = useCallback(
        (value: boolean) => {
            if (value) {
                if (!hasAnySsoProvider) {
                    return
                }
                setConfirmModalVisible(true)
                return
            }
            onSsoEnforced(null)
        },
        [hasAnySsoProvider, onSsoEnforced],
    )

    return (
        <>
            <div className="mt-5 mb-5">
                <h4 className="mb-2">SSO Enforcement</h4>
                <p>
                    Require all users to sign in using Single Sign-On (SSO).
                    Once enabled, password-based login will be disabled and
                    users will only be able to authenticate through an active
                    SSO provider.
                </p>
                {!hasAnySsoProvider && (
                    <p className="text-warning">
                        <i className="material-icons mr-1">warning</i>
                        You must enable at least one SSO provider (Google,
                        Microsoft 365, or a custom provider) before enforcing
                        SSO.
                    </p>
                )}
                <ToggleInput
                    name="ssoEnforcementToggle"
                    isToggled={isSsoEnforced}
                    isLoading={loading || confirmModalVisible}
                    isDisabled={isDisabled || !hasAnySsoProvider}
                    onClick={handleToggle}
                >
                    Require SSO for all users
                </ToggleInput>
            </div>

            <ConfirmationModal
                isOpen={confirmModalVisible}
                title="Enable SSO Enforcement?"
                confirmText="Enable"
                confirmIntent="primary"
                onConfirm={() => {
                    setSsoEnforced()
                    setConfirmModalVisible(false)
                }}
                onClose={() => setConfirmModalVisible(false)}
            >
                Once SSO is enforced, all users will be required to sign in
                using an SSO provider. Password-based login will be disabled.
                Make sure all your users have access to an active SSO provider
                before enabling this setting.
            </ConfirmationModal>
        </>
    )
}
