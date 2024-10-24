import classnames from 'classnames'
import React from 'react'
import {FormGroup} from 'reactstrap'

import {CallForwardingCountries} from 'business/twilio'
import CheckBox from 'pages/common/forms/CheckBox'
import PhoneNumberInput from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import ToggleInput from 'pages/common/forms/ToggleInput'

import settingsCss from 'pages/settings/settings.less'

import css from './ForwardingCallsPreferences.less'

type Props = {
    forwardCalls?: boolean
    forwardingPhoneNumber?: string
    forwardWhenOffline?: boolean
    setPreference: (key: string, value: any) => void
}

function ForwardingCallsPreferences({
    forwardCalls,
    forwardingPhoneNumber,
    forwardWhenOffline,
    setPreference,
}: Props) {
    return (
        <FormGroup
            className={classnames(settingsCss.inputField, settingsCss.mb40)}
        >
            <div className={settingsCss.headingSubsection}>
                Forward calls to an external number
            </div>
            <p className="body-regular">
                When you are routed a call in Gorgias, forward the call to a
                mobile device or landline.
            </p>

            <ToggleInput
                className={classnames(
                    settingsCss.inputField,
                    settingsCss.subsection
                )}
                name="forward_calls"
                isToggled={forwardCalls ?? false}
                onClick={(value: boolean) =>
                    setPreference('forward_calls', value)
                }
            >
                Enable call forwarding
            </ToggleInput>
            <div className={css.forwardingPhoneNumber}>
                <PhoneNumberInput
                    value={forwardingPhoneNumber ?? ''}
                    onChange={(value: string) =>
                        setPreference('forwarding_phone_number', value)
                    }
                    allowedCountries={Object.values(CallForwardingCountries)}
                    autoFocus
                    disabled={!forwardCalls}
                />
            </div>
            <div className={css.forwardWhenOffline}>
                <CheckBox
                    name="forward_when_offline"
                    isChecked={forwardWhenOffline ?? false}
                    onChange={(value: boolean) =>
                        setPreference('forward_when_offline', value)
                    }
                    isDisabled={!forwardCalls}
                    caption="Calls will be forwarded to this number when agent is available or offline."
                >
                    Forward calls when offline
                </CheckBox>
            </div>
        </FormGroup>
    )
}

export default ForwardingCallsPreferences
