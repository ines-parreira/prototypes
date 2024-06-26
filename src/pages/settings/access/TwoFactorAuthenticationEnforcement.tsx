import React, {useCallback, useState} from 'react'
import moment from 'moment-timezone'
import {Label} from '@gorgias/ui-kit'

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

/**
 * Generate a moment datetime based on a string and timezone.
 */
function setTimezone(
    enforcedDatetime: string | null,
    timezone: string | null
): moment.Moment | undefined {
    if (!enforcedDatetime) {
        return undefined
    }
    const enforcementDatetime = moment.utc(enforcedDatetime)
    if (timezone) {
        return enforcementDatetime.tz(timezone)
    }
    return enforcementDatetime
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
    const enforcementDatetime = setTimezone(twoFAEnforcedDatetime, userTimezone)

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

            set2FAEnforced(
                value ? moment().add(TWO_FA_REQUIRED_AFTER_DAYS, 'days') : null
            )
        },
        [has2FAEnabled, set2FAEnforced]
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
                            onSubmit={set2FAEnforced}
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
                        set2FAEnforced(
                            moment().add(TWO_FA_REQUIRED_AFTER_DAYS, 'days')
                        )
                    }}
                    initialBannerText="Set up two-factor authentication (2FA) for your own account. Once enabled, 2FA will be enforced for all helpdesk users."
                    initialBannerType="info"
                />
            )}
        </>
    )
}
