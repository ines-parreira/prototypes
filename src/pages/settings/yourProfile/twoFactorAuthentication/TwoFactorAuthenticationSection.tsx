import classnames from 'classnames'
import React, {useEffect, useMemo, useState} from 'react'

import {DateAndTimeFormatting} from 'constants/datetime'
import useAppSelector from 'hooks/useAppSelector'
import useSearch from 'hooks/useSearch'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Button from 'pages/common/components/button/Button'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import css from 'pages/settings/settings.less'
import TwoFactorAuthenticationModal from 'pages/settings/yourProfile/twoFactorAuthentication/TwoFactorAuthenticationModal/TwoFactorAuthenticationModal'
import {check2FARequired} from 'pages/settings/yourProfile/twoFactorAuthentication/utils'
import {
    getTwoFAEnforcedDatetime,
    is2FAEnforcedSelector,
} from 'state/currentAccount/selectors'
import {has2FaEnabled as has2FaEnabledSelector} from 'state/currentUser/selectors'

import {isRecentLogin} from '../utils'
import TwoFactorAuthenticationDisableModal from './TwoFactorAuthenticationDisableModal'

export default function TwoFactorAuthenticationSection() {
    const [is2FASetupModalOpen, setIs2FASetupModalOpen] = useState(false)
    const [isDisableModalOpen, setIsDisableModalOpen] = useState(false)

    const shouldEnforce2FASetupModal =
        useSearch<{
            enforce_2fa_setup_modal?: string
        }>().enforce_2fa_setup_modal?.toLowerCase() === 'true'

    const requireLogin = !isRecentLogin()

    const twoFAEnforcedDatetime = useAppSelector(getTwoFAEnforcedDatetime)
    const isTimeInFuture = twoFAEnforcedDatetime
        ? new Date(twoFAEnforcedDatetime).getTime() > new Date().getTime()
        : false

    const is2FAEnforced = useAppSelector(is2FAEnforcedSelector)
    const has2FAEnabled = useAppSelector(has2FaEnabledSelector)
    const is2FARequired = useMemo(() => {
        return check2FARequired(twoFAEnforcedDatetime, has2FAEnabled)
    }, [twoFAEnforcedDatetime, has2FAEnabled])

    useEffect(() => {
        if (shouldEnforce2FASetupModal && !has2FAEnabled && !requireLogin) {
            setIs2FASetupModalOpen(true)
        } else if (requireLogin) {
            setIs2FASetupModalOpen(false)
        }
    }, [shouldEnforce2FASetupModal, has2FAEnabled, requireLogin])

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
                    {has2FAEnabled ? '2FA Enabled' : '2FA Disabled'}
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
                        is2FAEnforced ? (
                            <>
                                For security reasons, your admin requires you to
                                set up two-factor authentication to access your
                                account
                                {isTimeInFuture && (
                                    <>
                                        {' '}
                                        by{' '}
                                        <b>
                                            <DatetimeLabel
                                                dateTime={
                                                    twoFAEnforcedDatetime!
                                                }
                                                labelFormat={
                                                    DateAndTimeFormatting.LongDateWithYear
                                                }
                                            />
                                        </b>
                                    </>
                                )}
                                .
                            </>
                        ) : undefined
                    }
                    initialBannerType={is2FARequired ? 'error' : 'warning'}
                    onCancel={() => {
                        setIs2FASetupModalOpen(false)
                    }}
                    onFinish={() => {
                        setIs2FASetupModalOpen(false)
                    }}
                    isUpdate={has2FAEnabled}
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
