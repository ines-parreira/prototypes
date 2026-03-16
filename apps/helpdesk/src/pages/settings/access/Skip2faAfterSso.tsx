import { useCallback, useState } from 'react'

import { UserRole } from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import ToggleInput from 'pages/common/forms/ToggleInput'
import { getCurrentUser } from 'state/currentUser/selectors'

import { ConfirmationModal } from '../helpCenter/components/ConfirmationModal'

type OwnProps = {
    skip2faAfterSsoDatetime: string | null
    loading: boolean
    disabled: boolean
    googleSsoEnabled: boolean
    office365SsoEnabled: boolean
    hasCustomSsoProviders: boolean
    onToggle: (val: string | null) => void
}

export default function Skip2faAfterSso({
    skip2faAfterSsoDatetime,
    loading,
    disabled,
    googleSsoEnabled,
    office365SsoEnabled,
    hasCustomSsoProviders,
    onToggle,
}: OwnProps) {
    const [confirmModalVisible, setConfirmModalVisible] = useState(false)

    const isEnabled = !!skip2faAfterSsoDatetime
    const hasAnySsoProvider =
        googleSsoEnabled || office365SsoEnabled || hasCustomSsoProviders

    const currentUser = useAppSelector(getCurrentUser)
    const isGorgiasAgent =
        currentUser.getIn(['role', 'name']) === UserRole.GorgiasAgent
    const isDisabled = isGorgiasAgent || disabled

    const enable = useCallback(() => {
        const isoString = new Date().toISOString().split('.')[0]
        onToggle(isoString)
    }, [onToggle])

    const handleToggle = useCallback(
        (value: boolean) => {
            if (value) {
                if (!hasAnySsoProvider) {
                    return
                }
                setConfirmModalVisible(true)
                return
            }
            onToggle(null)
        },
        [hasAnySsoProvider, onToggle],
    )

    return (
        <>
            <div className="mt-5 mb-5">
                <h4 className="mb-2">
                    Skip two-factor authentication after SSO
                </h4>
                <p>
                    When enabled, users who log in via SSO will not be asked for
                    a two-factor authentication code.
                </p>
                {!hasAnySsoProvider && (
                    <p className="text-warning">
                        <i className="material-icons mr-1">warning</i>
                        You must enable at least one SSO provider (Google,
                        Microsoft 365, or a custom provider) before enabling
                        this setting.
                    </p>
                )}
                <ToggleInput
                    name="skip2faAfterSsoToggle"
                    isToggled={isEnabled}
                    isLoading={loading || confirmModalVisible}
                    isDisabled={isDisabled || !hasAnySsoProvider}
                    onClick={handleToggle}
                >
                    Skip 2FA for SSO users
                </ToggleInput>
            </div>

            <ConfirmationModal
                isOpen={confirmModalVisible}
                title="Skip 2FA after SSO?"
                confirmText="Enable"
                confirmIntent="primary"
                onConfirm={() => {
                    enable()
                    setConfirmModalVisible(false)
                }}
                onClose={() => setConfirmModalVisible(false)}
            >
                When enabled, users who sign in through an SSO provider will no
                longer be prompted for two-factor authentication. Make sure your
                SSO provider enforces strong authentication before enabling this
                setting.
            </ConfirmationModal>
        </>
    )
}
