import {Label} from '@gorgias/ui-kit'
import classNames from 'classnames'
import moment, {Moment} from 'moment'
import React, {useCallback, useState} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import {DatePicker} from 'pages/common/forms/DatePicker'
import TextInput from 'pages/common/forms/input/TextInput'
import ToggleInput from 'pages/common/forms/ToggleInput'
import TwoFactorAuthenticationModal from 'pages/settings/yourProfile/twoFactorAuthentication/TwoFactorAuthenticationModal/TwoFactorAuthenticationModal'
import {
    TWO_FA_REQUIRED_AFTER_DAYS,
    TWO_FA_WARN_LESS_THAN_DAYS,
} from 'state/currentUser/constants'
import {
    getTimezone,
    has2FaEnabled as has2FaEnabledSelector,
} from 'state/currentUser/selectors'

import css from './TwoFactorAuthenticationEnforcement.less'

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
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
    const [twoFAEnforcement, setTwoFAEnforcement] = useState<string | null>(
        null
    )

    const has2FAEnabled = useAppSelector(has2FaEnabledSelector)
    const userTimezone = useAppSelector(getTimezone)

    const is2FAEnforced = !!twoFAEnforcedDatetime
    const enforcementDatetime = setTimezone(twoFAEnforcedDatetime, userTimezone)

    const set2FAEnforced = useCallback(
        (value: moment.Moment | null, showConfirmationPopover?: () => void) => {
            const strValue = value ? value.toISOString().split('.')[0] : null

            // Ask for confirmation if setting 2FA enforcement too early
            if (
                showConfirmationPopover &&
                value &&
                !value.isSame(enforcementDatetime) &&
                value.diff(moment(), 'days', true) < TWO_FA_WARN_LESS_THAN_DAYS
            ) {
                setTwoFAEnforcement(strValue)
                showConfirmationPopover()
            } else {
                on2FAEnforced(strValue)
            }
        },
        [on2FAEnforced, enforcementDatetime]
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
                        <ConfirmationPopover
                            placement="bottom-end"
                            title={
                                <>
                                    <i
                                        className={classNames(
                                            'material-icons',
                                            css.warningIcon
                                        )}
                                    >
                                        warning
                                    </i>
                                    <span>Confirm Enforcement Time</span>
                                </>
                            }
                            content={
                                <>
                                    <p>
                                        Enabling 2-Factor Authentication (2FA)
                                        is a crucial security measure.{' '}
                                        <b>
                                            To avoid disruptions, a two week
                                            notice is recommended for users to
                                            comply.
                                        </b>
                                    </p>
                                    <p>
                                        Insufficient notice can result in access
                                        issues. Consider sending a secondary
                                        reminder directly to your users.
                                    </p>
                                </>
                            }
                            confirmLabel="Confirm"
                            cancelLabel="Review"
                            cancelButtonProps={{intent: 'secondary'}}
                            onConfirm={() => on2FAEnforced(twoFAEnforcement)}
                            onCancel={() => setIsDatePickerOpen(true)}
                            showCancelButton
                        >
                            {({uid, onDisplayConfirmation, elementRef}) => (
                                <DatePicker
                                    initialSettings={{
                                        drops: 'auto',
                                        endDate: enforcementDatetime,
                                        startDate: enforcementDatetime,
                                    }}
                                    onSubmit={(value: Moment) =>
                                        set2FAEnforced(
                                            value,
                                            onDisplayConfirmation
                                        )
                                    }
                                    onHide={() => setIsDatePickerOpen(false)}
                                    isOpen={isDatePickerOpen}
                                >
                                    <div>
                                        <TextInput
                                            id="twoFAEnforcementDatetime"
                                            name="twoFAEnforcementDatetime"
                                            value={enforcementDatetime.format(
                                                'L LT'
                                            )}
                                            isDisabled={disabled || loading}
                                            ref={elementRef}
                                            data-1p-ignore
                                        />
                                        <div id={uid}></div>
                                    </div>
                                </DatePicker>
                            )}
                        </ConfirmationPopover>
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
