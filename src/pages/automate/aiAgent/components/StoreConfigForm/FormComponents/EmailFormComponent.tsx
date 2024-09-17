import {Label} from '@gorgias/ui-kit'
import classnames from 'classnames'
import React, {useMemo} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import useEffectOnce from 'hooks/useEffectOnce'
import useAppSelector from 'hooks/useAppSelector'
import {INITIAL_FORM_VALUES} from '../../../constants'
import {EmailIntegrationListSelection} from '../../EmailIntegrationListSelection/EmailIntegrationListSelection'
import {FeatureFlagKey} from '../../../../../../config/featureFlags'
import {getIntegrationsByTypes} from '../../../../../../state/integrations/selectors'
import {EMAIL_INTEGRATION_TYPES} from '../../../../../../constants/integration'
import {StoreConfiguration} from '../../../../../../models/aiAgent/types'
import {FormValues, UpdateValue} from '../../../types'
import css from './EmailFormComponent.less'

type EmailFormComponentProps = {
    updateValue: UpdateValue<FormValues>
    monitoredEmailIntegrations: {id: number; email: string}[] | null
    isDisabled?: boolean
}
export const EmailFormComponent = ({
    monitoredEmailIntegrations,
    updateValue,
    isDisabled,
}: EmailFormComponentProps) => {
    const useInitialValue = React.useRef(true)
    const isAiAgentChatEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentChat]

    const isRequired = isDisabled || !isAiAgentChatEnabled
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

    useEffectOnce(() => {
        if (emailItems.length === 1 && useInitialValue.current) {
            updateValue('monitoredEmailIntegrations', [emailItems[0]])

            useInitialValue.current = false
        }
    })

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
        updateValue('monitoredEmailIntegrations', monitoredEmailIntegrations)
    }

    return (
        <div className={css.formGroup}>
            <Label isRequired={!isRequired} className={css.label}>
                AI Agent responds to tickets sent to the following email
                addresses
            </Label>
            <EmailIntegrationListSelection
                selectedIds={
                    monitoredEmailIntegrations !== null
                        ? monitoredEmailIntegrations.map(
                              (integration) => integration.id
                          )
                        : INITIAL_FORM_VALUES.monitoredEmailIntegrations
                }
                onSelectionChange={handleSelectEmailIntegration}
                emailItems={emailItems}
            />
            <div
                className={classnames(css.formInputFooterInfo, {
                    [css.error]: !isEmailIntegrationsValid,
                })}
            >
                {!isEmailIntegrationsValid
                    ? 'At least one email is required.'
                    : 'Select one or more email addresses for AI Agent to use. It will also reply to contact forms linked to these email addresses.'}
            </div>
        </div>
    )
}
