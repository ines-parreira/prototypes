import React, {useCallback, useState} from 'react'
import moment from 'moment-timezone'
import ToggleInput from 'pages/common/forms/ToggleInput'
import useAppSelector from 'hooks/useAppSelector'
import {
    getTimezone,
    has2FaEnabled as has2FaEnabledSelector,
} from 'state/currentUser/selectors'
import TwoFactorAuthenticationModal from 'pages/settings/yourProfile/twoFactorAuthentication/TwoFactorAuthenticationModal/TwoFactorAuthenticationModal'
import {TWO_FA_REQUIRED_AFTER_DAYS} from 'state/currentUser/constants'
import {DatePicker} from 'pages/common/forms/DatePicker'
import TextInput from 'pages/common/forms/input/TextInput'
import Label from 'pages/common/forms/Label/Label'

/**
 * Convert an "enforced" date to an "enforcement" date by adding 14 days to it.
 * @see https://linear.app/gorgias/issue/APPED-1805/build-an-enforce-2fa-now-mechanism
 */
function enforcedToEnforcementDatetime(
    enforcedDatetime: string | null,
    timezone: string | null
): moment.Moment | undefined {
    if (!enforcedDatetime) {
        return undefined
    }
    const enforcementDatetime = moment
        .utc(enforcedDatetime)
        .add(TWO_FA_REQUIRED_AFTER_DAYS, 'days')
    if (timezone) {
        return enforcementDatetime.tz(timezone)
    }
    return enforcementDatetime
}

/**
 * Convert an "enforcement" date to an "enforced" date by substracting 14 days from it.
 * @see https://linear.app/gorgias/issue/APPED-1805/build-an-enforce-2fa-now-mechanism
 */
function enforcementToEnforcedDatetime(enforcementDatetime: moment.Moment) {
    return enforcementDatetime
        .subtract(TWO_FA_REQUIRED_AFTER_DAYS, 'days')
        .utc()
}

type OwnProps = {
    twoFAEnforcedDatetime: string | null
    loading: boolean
    disabled: boolean

    on2FAEnforced: (val: string | null) => void
}

export default function TwoFactorAuthenticationEnforcement({
    twoFAEnforcedDatetime,
    loading,
    disabled,
    on2FAEnforced,
}: OwnProps) {
    const [twoFAModalVisible, set2FAModalVisible] = useState(false)
    const has2FAEnabled = useAppSelector(has2FaEnabledSelector)
    const userTimezone = useAppSelector(getTimezone)

    const is2FAEnforced = !!twoFAEnforcedDatetime
    const enforcementDatetime = enforcedToEnforcementDatetime(
        twoFAEnforcedDatetime,
        userTimezone
    )

    const set2FAEnforced = useCallback(
        (value: moment.Moment | null) => {
            on2FAEnforced(value ? value.toISOString().split('.')[0] : null)
        },
        [on2FAEnforced]
    )

    const handleToggle = useCallback(
        (value: boolean) => {
            if (value && !has2FAEnabled) {
                set2FAModalVisible(true)
                return
            }

            set2FAEnforced(value ? moment() : null)
        },
        [has2FAEnabled, set2FAEnforced]
    )
    const handleSetEnforcementDatetime = useCallback(
        (value: moment.Moment) => {
            set2FAEnforced(enforcementToEnforcedDatetime(value))
        },
        [set2FAEnforced]
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
                    Require 2FA for all users
                </ToggleInput>

                {enforcementDatetime && (
                    <div className="mt-3">
                        <Label
                            htmlFor="twoFAEnforcementDatetime"
                            isRequired
                            isDisabled={disabled || loading}
                            className="mb-2"
                        >
                            Enforcement time
                        </Label>
                        <DatePicker
                            initialSettings={{
                                drops: 'auto',
                                endDate: enforcementDatetime,
                                startDate: enforcementDatetime,
                            }}
                            onSubmit={handleSetEnforcementDatetime}
                        >
                            <div>
                                <TextInput
                                    id="twoFAEnforcementDatetime"
                                    name="twoFAEnforcementDatetime"
                                    value={enforcementDatetime.format('L LT')}
                                    isDisabled={disabled || loading}
                                    data-1p-ignore
                                />
                            </div>
                        </DatePicker>
                    </div>
                )}
            </div>

            {twoFAModalVisible && (
                <TwoFactorAuthenticationModal
                    isOpen={twoFAModalVisible}
                    onCancel={() => {
                        set2FAModalVisible(false)
                    }}
                    onFinish={() => {
                        set2FAModalVisible(false)
                        set2FAEnforced(moment())
                    }}
                    initialBannerText="Set up two-factor authentication (2FA) for your own account. Once enabled, 2FA will be enforced for all helpdesk users."
                    initialBannerType="info"
                />
            )}
        </>
    )
}
