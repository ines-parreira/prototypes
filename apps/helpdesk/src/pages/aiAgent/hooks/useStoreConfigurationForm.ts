import { useEffect, useMemo, useState } from 'react'

import { EMAIL_INTEGRATION_TYPES } from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import type { HelpCenter } from 'models/helpCenter/types'
import { useConfigurationForm } from 'pages/aiAgent/hooks/useConfigurationForm'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

import { INITIAL_FORM_VALUES } from '../constants'
import { useAiAgentStoreConfigurationContext } from '../providers/AiAgentStoreConfigurationContext'
import type { FormValues } from '../types'
import { isAiAgentEnabled } from '../util'
import { getFormValuesFromStoreConfiguration } from './utils/configurationForm.utils'

type EmailItem = {
    email: string
    id: number
}

const areEmailListsEqual = (arr1: EmailItem[], arr2: EmailItem[]): boolean => {
    if (!arr1 || !arr2) return false
    if (arr1.length !== arr2.length) return false

    return arr1.every((item1) =>
        arr2.some(
            (item2) => item1.id === item2.id && item1.email === item2.email,
        ),
    )
}

/**
 * A custom hook that enables the capability to create a form for the store configuration of AI agent.
 * It manages everything including the state of the form, the capability to edit values, and submit the form.
 * It also exports some useful utility booleans like the channels enablement status.
 *
 * This hook wraps the existing `useConfigurationForm` hook as a simplification until we rework the way this big form is built.
 *
 * @param shopName - The name of the shop.
 * @param faqHelpCenters - An array of HelpCenter objects.
 * @returns An object containing the form configuration and utility booleans for channel enablement.
 */
export const useStoreConfigurationForm = (
    shopName: string,
    shopType: string,
    faqHelpCenters: HelpCenter[],
) => {
    // because this selector is a function which return function we need to memoized it before send to reselect
    const selector = useMemo(
        () => getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES),
        [],
    )
    const emailIntegrations = useAppSelector(selector)
    const [emailItems, setEmailItems] = useState<EmailItem[]>([])

    useEffect(() => {
        const newEmails = emailIntegrations.map((integration) => ({
            email: integration.meta.address,
            id: integration.id,
        }))

        if (areEmailListsEqual(newEmails, emailItems)) return

        setEmailItems(newEmails)
    }, [emailIntegrations, emailItems])

    const { storeConfiguration } = useAiAgentStoreConfigurationContext()

    const defaultFormValues: Partial<FormValues> = useMemo(() => {
        const initialHelpCenter = faqHelpCenters[0]
        const initialEmail = emailItems[0]

        return storeConfiguration
            ? getFormValuesFromStoreConfiguration(storeConfiguration)
            : {
                  ...INITIAL_FORM_VALUES,
                  monitoredEmailIntegrations: [initialEmail],
                  helpCenterId: initialHelpCenter?.id ?? null,
              }
    }, [emailItems, faqHelpCenters, storeConfiguration])

    const configurationForm = useConfigurationForm({
        initValues: defaultFormValues,
        shopName,
        shopType,
    })

    const isEmailChannelEnabled = isAiAgentEnabled(
        configurationForm.formValues.emailChannelDeactivatedDatetime !==
            undefined
            ? configurationForm.formValues.emailChannelDeactivatedDatetime
            : INITIAL_FORM_VALUES.emailChannelDeactivatedDatetime,
    )

    const isChatChannelEnabled = isAiAgentEnabled(
        configurationForm.formValues.chatChannelDeactivatedDatetime !==
            undefined
            ? configurationForm.formValues.chatChannelDeactivatedDatetime
            : INITIAL_FORM_VALUES.chatChannelDeactivatedDatetime,
    )

    const isSmsChannelEnabled = isAiAgentEnabled(
        configurationForm.formValues.smsChannelDeactivatedDatetime !== undefined
            ? configurationForm.formValues.smsChannelDeactivatedDatetime
            : INITIAL_FORM_VALUES.smsChannelDeactivatedDatetime,
    )

    return {
        ...configurationForm,
        isEmailChannelEnabled,
        isChatChannelEnabled,
        isSmsChannelEnabled,
    }
}
