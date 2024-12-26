import {Label} from '@gorgias/merchant-ui-kit'
import classnames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useEffect, useMemo} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {EMAIL_INTEGRATION_TYPES} from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import {StoreConfiguration} from 'models/aiAgent/types'
import {getIntegrationsByTypes} from 'state/integrations/selectors'

import {INITIAL_FORM_VALUES} from '../../../constants'
import {FormValues, UpdateValue} from '../../../types'
import {EmailIntegrationListSelection} from '../../EmailIntegrationListSelection/EmailIntegrationListSelection'
import css from './EmailFormComponent.less'

type EmailFormComponentProps = {
    updateValue: UpdateValue<FormValues>
    monitoredEmailIntegrations: {id: number; email: string}[] | null
    isRequired?: boolean
    isDisabled?: boolean
    shouldPrefillValue?: boolean
    setIsPristine?: (isPristine: boolean) => void
}
export const EmailFormComponent = ({
    monitoredEmailIntegrations,
    updateValue,
    isRequired,
    shouldPrefillValue,
    setIsPristine,
    isDisabled,
}: EmailFormComponentProps) => {
    const useInitialValue = React.useRef(true)
    const isAiAgentChatEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentChat]

    const isValueRequired = isRequired || !isAiAgentChatEnabled
    const isEmailIntegrationsValid = useMemo(() => {
        const isEmailSelected = !!monitoredEmailIntegrations?.length
        return isEmailSelected || !isRequired
    }, [monitoredEmailIntegrations?.length, isRequired])

    const selector = useMemo(
        () => getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES),
        []
    )
    const emailIntegrations = useAppSelector(selector)
    const emailItems = useMemo(() => {
        return emailIntegrations.map((integration) => ({
            email: integration.meta.address,
            id: integration.id,
        }))
    }, [emailIntegrations])

    useEffect(() => {
        if (
            emailItems.length === 1 &&
            useInitialValue.current &&
            shouldPrefillValue
        ) {
            updateValue('monitoredEmailIntegrations', [emailItems[0]])

            useInitialValue.current = false
        }
    }, [emailItems, shouldPrefillValue, updateValue])

    const handleSelectEmailIntegration = (nextSelectedIds: number[]) => {
        // preserving the order of the selection
        const monitoredEmailIntegrations: StoreConfiguration['monitoredEmailIntegrations'] =
            []
        for (const id of nextSelectedIds) {
            const emailIntegration = emailIntegrations.find(
                (integration) => integration.id === id
            )
            if (emailIntegration) {
                monitoredEmailIntegrations.push({
                    id: emailIntegration.id,
                    email: emailIntegration.meta.address,
                })
            }
        }
        if (setIsPristine) setIsPristine(false)
        updateValue('monitoredEmailIntegrations', monitoredEmailIntegrations)
    }

    return (
        <div className={css.formGroup}>
            <Label
                isRequired={isValueRequired}
                className={css.label}
                id="monitored-email-channels"
            >
                AI Agent responds to tickets sent to the following email
                addresses
            </Label>
            <EmailIntegrationListSelection
                labelId="monitored-email-channels"
                selectedIds={
                    !!monitoredEmailIntegrations
                        ? monitoredEmailIntegrations.map(
                              (integration) => integration.id
                          )
                        : INITIAL_FORM_VALUES.monitoredEmailIntegrations
                }
                onSelectionChange={handleSelectEmailIntegration}
                emailItems={emailItems}
                hasError={!isEmailIntegrationsValid}
                isDisabled={isDisabled}
            />
            <div
                className={classnames(css.formInputFooterInfo, {
                    [css.error]: !isEmailIntegrationsValid,
                })}
            >
                {!isEmailIntegrationsValid
                    ? 'One or more addresses required.'
                    : 'Select one or more email addresses for AI Agent to use. It will also reply to contact forms linked to these email addresses.'}
            </div>
        </div>
    )
}
