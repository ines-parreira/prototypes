import React, { useCallback, useEffect, useMemo } from 'react'

import classnames from 'classnames'

import { INITIAL_FORM_VALUES } from 'pages/aiAgent/constants'
import type { FormValues, UpdateValue } from 'pages/aiAgent/types'
import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'

import { SmsIntegrationListSelection } from '../../SmsIntegrationListSelection/SmsIntegrationListSelection'
import { useSmsPhoneNumbers } from '../hooks/useSmsPhoneNumbers'
import { SmsFooterFormComponent } from './SmsFooterFormComponent'

import css from './SmsSettingsFormComponent.less'

type SmsSettingsFormComponentProps = {
    updateValue: UpdateValue<FormValues>
    monitoredSmsIntegrations: number[] | null
    smsDisclaimer: string | null
    initialValue?: number
    isFieldDirty?: boolean
    isRequired?: boolean
    isDisabled?: boolean
    shouldPrefillValue?: boolean
    setIsPristine?: (isPristine: boolean) => void
}

export const SmsSettingsFormComponent = ({
    monitoredSmsIntegrations,
    smsDisclaimer,
    updateValue,
    initialValue,
    isRequired,
    shouldPrefillValue,
    setIsPristine,
    isDisabled,
}: SmsSettingsFormComponentProps) => {
    const useInitialValue = React.useRef(true)

    const smsPhoneNumbers = useSmsPhoneNumbers()

    useEffect(() => {
        if (
            useInitialValue.current &&
            initialValue &&
            monitoredSmsIntegrations?.length === 0 &&
            shouldPrefillValue
        ) {
            updateValue('monitoredSmsIntegrations', [initialValue])
            useInitialValue.current = false
        }
    }, [
        initialValue,
        monitoredSmsIntegrations,
        shouldPrefillValue,
        updateValue,
    ])

    const selectedSms = useMemo(() => {
        const monitoredSmsIntegrationsSet = new Set(
            monitoredSmsIntegrations ?? [],
        )
        return smsPhoneNumbers.filter((sms) =>
            monitoredSmsIntegrationsSet.has(sms.id),
        )
    }, [monitoredSmsIntegrations, smsPhoneNumbers])

    const smsIntegrationsValidationError = useMemo(() => {
        // The first error is displayed, so the errors should be pushed in order of priority
        if (!selectedSms?.length && isRequired) {
            return 'One or more SMS required.'
        }

        return null
    }, [selectedSms, isRequired])

    const hasError = useMemo(() => {
        return !!smsIntegrationsValidationError && isRequired
    }, [smsIntegrationsValidationError, isRequired])

    const handleSelectSmsIntegration = useCallback(
        (values: number[]) => {
            if (setIsPristine) setIsPristine(false)
            updateValue('monitoredSmsIntegrations', values)
        },
        [updateValue, setIsPristine],
    )

    return (
        <div className={css.smsSettingsFormComponent}>
            <section>
                <SettingsCard>
                    <SettingsCardHeader>
                        <SettingsCardTitle
                            id="monitored-sms-channels"
                            isRequired={isRequired}
                        >
                            Select one or more SMS phone numbers
                        </SettingsCardTitle>
                        Connect phone numbers associated with your existing SMS
                        integrations.
                    </SettingsCardHeader>
                    <SettingsCardContent>
                        <div>
                            <SmsIntegrationListSelection
                                labelId="monitored-sms-channels"
                                selectedIds={
                                    monitoredSmsIntegrations !== null
                                        ? monitoredSmsIntegrations
                                        : INITIAL_FORM_VALUES.monitoredSmsIntegrations
                                }
                                onSelectionChange={handleSelectSmsIntegration}
                                smsItems={smsPhoneNumbers}
                                hasError={hasError}
                                isDisabled={isDisabled}
                            />
                            <div
                                className={classnames(css.formInputFooterInfo, {
                                    [css.error]: hasError,
                                })}
                            >
                                {smsIntegrationsValidationError}
                            </div>
                        </div>
                    </SettingsCardContent>
                </SettingsCard>
            </section>
            <section>
                <SmsFooterFormComponent
                    smsDisclaimer={smsDisclaimer}
                    updateValue={updateValue}
                    setIsPristine={setIsPristine}
                    isRequired={false}
                />
            </section>
        </div>
    )
}
