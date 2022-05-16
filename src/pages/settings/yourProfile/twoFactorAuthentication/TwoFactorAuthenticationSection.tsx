import React, {useEffect, useMemo, useState} from 'react'
import classnames from 'classnames'

import useAppSelector from 'hooks/useAppSelector'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Button from 'pages/common/components/button/Button'
import css from 'pages/settings/settings.less'
import {
    getTwoFAEnforcedDatetime,
    is2FAEnforcedSelector,
} from 'state/currentAccount/selectors'
import TwoFactorAuthenticationModal from 'pages/settings/yourProfile/twoFactorAuthentication/TwoFactorAuthenticationModal/TwoFactorAuthenticationModal'
import {has2FaEnabled as has2FaEnabledSelector} from 'state/currentUser/selectors'
import {check2FARequired} from 'pages/settings/yourProfile/twoFactorAuthentication/utils'
import useSearch from 'hooks/useSearch'
import TwoFactorAuthenticationDisableModal from './TwoFactorAuthenticationDisableModal'

export default function TwoFactorAuthenticationSection() {
    const [is2FASetupModalOpen, setIs2FASetupModalOpen] = useState(false)
    const [isDisableModalOpen, setIsDisableModalOpen] = useState(false)

    const shouldEnforce2FASetupModal =
        useSearch<{
            enforce_2fa_setup_modal?: string
        }>().enforce_2fa_setup_modal?.toLowerCase() === 'true'

    const twoFAEnforcedDatetime = useAppSelector(getTwoFAEnforcedDatetime)
    const is2FAEnforced = useAppSelector(is2FAEnforcedSelector)
    const has2FAEnabled = useAppSelector(has2FaEnabledSelector)
    const is2FARequired = useMemo(() => {
        return check2FARequired(twoFAEnforcedDatetime, has2FAEnabled)
    }, [twoFAEnforcedDatetime, has2FAEnabled])

    useEffect(() => {
        if (shouldEnforce2FASetupModal && !has2FAEnabled) {
            setIs2FASetupModalOpen(true)
        }
    }, [shouldEnforce2FASetupModal, has2FAEnabled])

    return (
        <>
            <div
                className={classnames('heading-subsection-semibold', css.mb16)}
            >
                Two-Factor Authentication (2FA)
                <Badge
                    className="ml-3 "
                    type={has2FAEnabled ? ColorType.Success : ColorType.Error}
                >
                    {has2FAEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
            </div>
            <div className={classnames('body-regular', css.mb16)}>
                For an added layer of security, enable Two-Factor Authentication
                for your Gorgias login.
            </div>

            <Button
                type="button"
                className="mr-2"
                intent={has2FAEnabled ? 'secondary' : 'primary'}
                onClick={() => {
                    setIs2FASetupModalOpen(true)
                }}
            >
                {has2FAEnabled ? 'Update 2FA' : 'Enable 2FA'}
            </Button>

            {has2FAEnabled && !is2FAEnforced && (
                <Button
                    onClick={() => setIsDisableModalOpen(true)}
                    intent="destructive"
                >
                    Disable 2FA
                </Button>
            )}

            {is2FASetupModalOpen && (
                <TwoFactorAuthenticationModal
                    isOpen={is2FASetupModalOpen}
                    initialBannerText={
                        is2FAEnforced
                            ? 'For security reasons, your admin requires you to setup two-factor authentication in order to access your account.'
                            : undefined
                    }
                    initialBannerType={is2FARequired ? 'error' : 'info'}
                    onCancel={() => {
                        setIs2FASetupModalOpen(false)
                    }}
                    onFinish={() => {
                        setIs2FASetupModalOpen(false)
                    }}
                />
            )}

            {isDisableModalOpen && (
                <TwoFactorAuthenticationDisableModal
                    title="Disable Two-Factor Authentication (2FA)?"
                    actionButtonText="Disable 2FA"
                    isOpen={isDisableModalOpen}
                    onClose={() => setIsDisableModalOpen(false)}
                    onSuccess={() => setIsDisableModalOpen(false)}
                >
                    Your account will no longer benefit from this extra layer of
                    security.
                </TwoFactorAuthenticationDisableModal>
            )}
        </>
    )
}
