import { useMemo } from 'react'

import { useParams } from 'react-router-dom'

import { useGetHelpCenterList } from 'models/helpCenter/queries'
import { INITIAL_FORM_VALUES } from 'pages/aiAgent/constants'
import { useConfigurationForm } from 'pages/aiAgent/hooks/useConfigurationForm'
import { getFormValuesFromStoreConfiguration } from 'pages/aiAgent/hooks/utils/configurationForm.utils'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import type { FormValues } from 'pages/aiAgent/types'
import { EMPTY_HELP_CENTER_ID } from 'pages/automate/common/components/HelpCenterSelect'
import { HELP_CENTER_MAX_CREATION } from 'pages/settings/helpCenter/constants'

const EMPTY_FAQ_HELP_CENTER = {
    id: EMPTY_HELP_CENTER_ID,
    name: 'No help center',
}
export function useFaqHelpCenter() {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()

    const { isLoading: isStoreConfigLoading, storeConfiguration } =
        useAiAgentStoreConfigurationContext()

    const { data: helpCenterListData } = useGetHelpCenterList(
        { type: 'faq', per_page: HELP_CENTER_MAX_CREATION },
        {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
        },
    )

    const faqHelpCenters = useMemo(
        () => helpCenterListData?.data.data ?? [],
        [helpCenterListData],
    )

    const defaultFormValues: Partial<FormValues> = useMemo(() => {
        if (isStoreConfigLoading) {
            return INITIAL_FORM_VALUES
        }

        const initialHelpCenter = faqHelpCenters[0]

        return storeConfiguration
            ? getFormValuesFromStoreConfiguration(storeConfiguration)
            : {
                  ...INITIAL_FORM_VALUES,
                  helpCenterId: initialHelpCenter?.id ?? null,
              }
    }, [faqHelpCenters, storeConfiguration, isStoreConfigLoading])

    const { handleOnSave, formValues, updateValue, isPendingCreateOrUpdate } =
        useConfigurationForm({
            initValues: defaultFormValues,
            shopName,
            shopType,
        })

    const selectedHelpCenter =
        (formValues.helpCenterId
            ? faqHelpCenters.find((helpCenter) => {
                  return helpCenter.id === formValues.helpCenterId
              })
            : undefined) || EMPTY_FAQ_HELP_CENTER

    const setHelpCenterId = (id: number) => {
        if (id === EMPTY_HELP_CENTER_ID) {
            updateValue('helpCenterId', null)
            return
        }

        updateValue('helpCenterId', id)
    }

    const helpCenterItems = useMemo(
        () => [
            { id: EMPTY_HELP_CENTER_ID, name: 'No help center' },
            ...faqHelpCenters,
        ],
        [faqHelpCenters],
    )

    return {
        faqHelpCenters,
        selectedHelpCenter,
        setHelpCenterId,
        handleOnSave,
        shopName,
        isPendingCreateOrUpdate,
        helpCenterItems,
    }
}
