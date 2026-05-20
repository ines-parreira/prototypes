import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import type { Map } from 'immutable'
import { useForm } from 'react-hook-form'

import type { LanguageItem } from 'config/integrations/gorgias_chat'
import {
    getGorgiasChatLanguageOptionsPlainJS,
    getHasShopifyScriptTagScopes,
    GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    mapIntegrationLanguagesToLanguagePicker,
    mapLanguagePickerToIntegrationLanguages,
} from 'config/integrations/gorgias_chat'
import useAppSelector from 'hooks/useAppSelector'
import type { StoreIntegration } from 'models/integration/types'
import {
    GorgiasChatCreationWizardInstallationMethod,
    IntegrationType,
    isShopifyIntegration,
} from 'models/integration/types'
import type { Language } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/LanguagePicker'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

export type LiveChatAvailability =
    | 'auto-based-on-agent-availability'
    | 'offline'

export type BasicsFormValues = {
    name: string
    language: string
    languages: LanguageItem[]
    storeIntegration: StoreIntegration | false | undefined
    liveChatAvailability: LiveChatAvailability
    installationMethod: GorgiasChatCreationWizardInstallationMethod
}

type UseBasicsFormParams = {
    integration: Map<any, any>
    isUpdate: boolean
}

const getDefaultStoreIntegration = (
    integration: Map<any, any>,
    storeIntegrations: StoreIntegration[],
    isUpdate: boolean,
): StoreIntegration | undefined => {
    if (isUpdate) {
        return storeIntegrations.find(
            (store) =>
                store?.id ===
                integration.getIn(['meta', 'shop_integration_id']),
        )
    }
    return storeIntegrations.length === 1 ? storeIntegrations[0] : undefined
}

const buildDefaultValues = (
    integration: Map<any, any>,
    storeIntegrations: StoreIntegration[],
    isUpdate: boolean,
): BasicsFormValues => {
    const language = integration.getIn(
        ['meta', 'language'],
        GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    )

    return {
        name: integration.get('name') ?? '',
        language,
        languages: [{ language, primary: true }],
        storeIntegration: getDefaultStoreIntegration(
            integration,
            storeIntegrations,
            isUpdate,
        ),
        liveChatAvailability: integration.getIn(
            ['meta', 'preferences', 'live_chat_availability'],
            GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
        ),
        installationMethod: integration.getIn(
            ['meta', 'wizard', 'installation_method'],
            GorgiasChatCreationWizardInstallationMethod.OneClick,
        ),
    }
}

export const useBasicsForm = ({
    integration,
    isUpdate,
}: UseBasicsFormParams) => {
    const { value: enableNewLanguages } = useFlagWithLoading(
        FeatureFlagKey.EnableNewLanguages,
    )

    const gorgiasChatIntegrations = useAppSelector(
        getIntegrationsByTypes([IntegrationType.GorgiasChat]),
    )

    const storeIntegrations = useAppSelector(
        getIntegrationsByTypes([
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ]),
    )

    const {
        watch,
        setValue,
        formState: { isDirty },
    } = useForm<BasicsFormValues>({
        defaultValues: buildDefaultValues(
            integration,
            storeIntegrations,
            isUpdate,
        ),
    })

    const values = watch()

    const isStoreRequired =
        values.installationMethod ===
        GorgiasChatCreationWizardInstallationMethod.OneClick

    const hasIncompleteFields =
        !values.name || (isStoreRequired && !values.storeIntegration)

    const isStoreOfShopifyType =
        values.storeIntegration && isShopifyIntegration(values.storeIntegration)

    const hasShopifyScriptTagScope =
        values.storeIntegration &&
        getHasShopifyScriptTagScopes({
            storeIntegration: values.storeIntegration,
        })

    const languagePickerLanguages = useMemo(
        () => mapIntegrationLanguagesToLanguagePicker(integration),
        [integration],
    )

    const availableLanguages = useMemo(
        () => getGorgiasChatLanguageOptionsPlainJS(enableNewLanguages),
        [enableNewLanguages],
    )

    const handleLanguageChange = useCallback(
        (languages: Language[]) => {
            const integrationLanguages =
                mapLanguagePickerToIntegrationLanguages(languages)
            setValue('languages', integrationLanguages, { shouldDirty: true })
            const primaryLanguage = integrationLanguages.find((x) => x.primary)
            if (primaryLanguage) {
                setValue('language', primaryLanguage.language, {
                    shouldDirty: true,
                })
            }
        },
        [setValue],
    )

    const handleInstallationPlatformChange = useCallback(
        (value: string) => {
            if (value === 'ecommerce-platforms') {
                if (
                    !values.storeIntegration &&
                    storeIntegrations.length === 1
                ) {
                    setValue('storeIntegration', storeIntegrations[0], {
                        shouldDirty: true,
                    })
                }
                setValue(
                    'installationMethod',
                    GorgiasChatCreationWizardInstallationMethod.OneClick,
                    { shouldDirty: true },
                )
            } else {
                setValue(
                    'installationMethod',
                    GorgiasChatCreationWizardInstallationMethod.Manual,
                    { shouldDirty: true },
                )
            }
        },
        [setValue, storeIntegrations, values.storeIntegration],
    )

    const handleStoreChange = useCallback(
        (storeIntegrationId: number) => {
            const selectedStore = storeIntegrations.find(
                (store) => store.id === storeIntegrationId,
            )
            setValue('storeIntegration', selectedStore, { shouldDirty: true })
            if (!values.name && selectedStore) {
                setValue('name', selectedStore.name, { shouldDirty: true })
            }
        },
        [setValue, storeIntegrations, values.name],
    )

    const handleNameChange = useCallback(
        (name: string) => {
            setValue('name', name, { shouldDirty: true })
        },
        [setValue],
    )

    const handleLiveChatAvailabilityChange = useCallback(
        (availability: LiveChatAvailability) => {
            setValue('liveChatAvailability', availability, {
                shouldDirty: true,
            })
        },
        [setValue],
    )

    return {
        values,
        isDirty,
        hasIncompleteFields,
        isStoreRequired,
        isStoreOfShopifyType,
        hasShopifyScriptTagScope,
        gorgiasChatIntegrations,
        storeIntegrations,
        languagePickerLanguages,
        availableLanguages,
        handlers: {
            handleNameChange,
            handleLanguageChange,
            handleInstallationPlatformChange,
            handleStoreChange,
            handleLiveChatAvailabilityChange,
        },
    }
}
