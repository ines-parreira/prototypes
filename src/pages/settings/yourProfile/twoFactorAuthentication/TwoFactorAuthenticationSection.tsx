import React, {useState} from 'react'
import classnames from 'classnames'

import useAppSelector from 'hooks/useAppSelector'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Button from 'pages/common/components/button/Button'
import css from 'pages/settings/settings.less'
import {has2FaEnabled as has2FaEnabledSelector} from '../../../../state/currentUser/selectors'
import TwoFactorAuthenticationDisableModal from './TwoFactorAuthenticationDisableModal'
import TwoFactorAuthenticationModal from './TwoFactorAuthenticationModal/TwoFactorAuthenticationModal'

export default function TwoFactorAuthenticationSection() {
    const [isEnableModalOpen, setIsEnableModalOpen] = useState(false)
    const [isDisableModalOpen, setIsDisableModalOpen] = useState(false)

    const is2FaEnforced = false // TODO(@Nicolas): fetch this from api when adding enforcing mechanism
    const has2FaEnabled = useAppSelector(has2FaEnabledSelector)

    return (
        <>
            <div
                className={classnames('heading-subsection-semibold', css.mb16)}
            >
                Two-Factor Authentication (2FA)
                <Badge
                    className="ml-3 "
                    type={has2FaEnabled ? ColorType.Success : ColorType.Error}
                >
                    {has2FaEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
            </div>
            <div className={classnames('body-regular', css.mb16)}>
                For an added layer of security, your admin requires you to use
                two-factor authentication (2FA) when you sign in to Gorgias.
            </div>

            <Button
                type="button"
                className="mr-2"
                intent={has2FaEnabled ? 'secondary' : 'primary'}
                onClick={() => setIsEnableModalOpen(true)}
            >
                {has2FaEnabled ? 'Update 2FA' : 'Enable 2FA'}
            </Button>

            {has2FaEnabled && !is2FaEnforced && (
                <Button
                    onClick={() => setIsDisableModalOpen(true)}
                    intent="destructive"
                >
                    Disable 2FA
                </Button>
            )}

            {isEnableModalOpen && (
                <TwoFactorAuthenticationModal
                    isOpen={isEnableModalOpen}
                    setIsOpen={setIsEnableModalOpen}
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
