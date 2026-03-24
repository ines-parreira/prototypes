import { useEffect, useMemo, useRef } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import classnames from 'classnames'
import { useParams } from 'react-router'

import { EMAIL_INTEGRATION_TYPES } from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import type { StoreConfiguration } from 'models/aiAgent/types'
import { EmailIntegrationListSelection } from 'pages/aiAgent/components/EmailIntegrationListSelection/EmailIntegrationListSelection'
import type { EmailItem } from 'pages/aiAgent/components/EmailIntegrationListSelection/EmailIntegrationListSelection'
import { INITIAL_FORM_VALUES } from 'pages/aiAgent/constants'
import { useGetAlreadyUsedEmailIntegrationIds } from 'pages/aiAgent/hooks/useGetAlreadyUsedEmailIntegrationIds'
import type { FormValues, UpdateValue } from 'pages/aiAgent/types'
import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

import css from './EmailFormComponent.less'

export const emailSortingCallback = (a: EmailItem, b: EmailItem) => {
    if (a.isDisabled && !b.isDisabled) {
        return 1
    }
    if (b.isDisabled && !a.isDisabled) {
        return -1
    }
    if (a.isDefault) {
        return -1
    }
    if (b.isDefault) {
        return 1
    }
    return a.email.localeCompare(b.email)
}

type EmailFormComponentProps = {
    updateValue: UpdateValue<FormValues>
    monitoredEmailIntegrations: { id: number; email: string }[] | null
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
    const useInitialValue = useRef(true)
    const isAiAgentChatEnabled = useFlag(FeatureFlagKey.AiAgentChat)

    const isValueRequired = isRequired || !isAiAgentChatEnabled
    const isEmailIntegrationsValid = useMemo(() => {
        const isEmailSelected = !!monitoredEmailIntegrations?.length
        return isEmailSelected || !isRequired
    }, [monitoredEmailIntegrations?.length, isRequired])

    const selector = useMemo(
        () => getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES),
        [],
    )
    const emailIntegrations = useAppSelector(selector)
    const { shopName } = useParams<{ shopName: string }>()
    const alreadyUsedEmailIntegrationIds =
        useGetAlreadyUsedEmailIntegrationIds(shopName)
    const emailItems = useMemo(() => {
        return emailIntegrations.map((integration) => ({
            email: integration.meta.address,
            id: integration.id,
            isDefault: integration.meta.preferred,
            isDisabled: alreadyUsedEmailIntegrationIds.includes(integration.id),
        }))
    }, [emailIntegrations, alreadyUsedEmailIntegrationIds])

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
                (integration) => integration.id === id,
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
            <SettingsCard>
                <SettingsCardHeader>
                    <SettingsCardTitle
                        id="monitored-email-channels"
                        isRequired={isValueRequired}
                    >
                        Select one or more emails for AI Agent
                    </SettingsCardTitle>
                    AI Agent will also respond to any contact forms linked to
                    these email addresses.
                </SettingsCardHeader>
                <SettingsCardContent>
                    <div>
                        <EmailIntegrationListSelection
                            labelId="monitored-email-channels"
                            selectedIds={
                                !!monitoredEmailIntegrations
                                    ? monitoredEmailIntegrations.map(
                                          (integration) => integration.id,
                                      )
                                    : INITIAL_FORM_VALUES.monitoredEmailIntegrations
                            }
                            onSelectionChange={handleSelectEmailIntegration}
                            sortingCallback={emailSortingCallback}
                            emailItems={emailItems}
                            hasError={!isEmailIntegrationsValid}
                            isDisabled={isDisabled}
                            withDefaultTag
                        />
                        <div
                            className={classnames(css.formInputFooterInfo, {
                                [css.error]: !isEmailIntegrationsValid,
                            })}
                        >
                            {!isEmailIntegrationsValid &&
                                'One or more addresses required.'}
                        </div>
                    </div>
                </SettingsCardContent>
            </SettingsCard>
        </div>
    )
}
