import { useCallback, useMemo } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffectOnce } from '@repo/hooks'
import { get } from 'lodash'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { LegacyButton as Button } from '@gorgias/axiom'

import { getPrimaryLanguageFromChatConfig } from 'config/integrations/gorgias_chat'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import * as IntegrationsActions from 'state/integrations/actions'
import { getGorgiasChatIntegrationsByStoreName } from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { AiAgentLayout } from './components/AiAgentLayout/AiAgentLayout'
import { CustomerEngagementSettings } from './components/CustomerEngagementSettings/CustomerEngagementSettings'
import { useTexts } from './components/CustomerEngagementSettings/hooks/useTexts'
import { CHANGES_SAVED_SUCCESS, SALES } from './constants'
import { useShoppingAssistantTracking } from './hooks/useShoppingAssistantTracking'
import { useAiAgentStoreConfigurationContext } from './providers/AiAgentStoreConfigurationContext'

import css from './AiAgentCustomerEngagement.less'

const customerEngagementSchema = z.object({
    isConversationStartersEnabled: z.boolean(),
    isConversationStartersDesktopOnly: z.boolean(),
    isAskAnythingInputEnabled: z.boolean(),
    isFloatingInputDesktopOnly: z.boolean(),
    isSalesHelpOnSearchEnabled: z.boolean(),
    needHelpText: z.string(),
    embeddedSpqEnabled: z.boolean(),
})

export type CustomerEngagementData = z.infer<typeof customerEngagementSchema>

export const AiAgentCustomerEngagement = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()
    const dispatch = useAppDispatch()

    const {
        onShoppingAssistantCustomerEngagementViewed,
        onShoppingAssistantCustomerEngagementUpdated,
    } = useShoppingAssistantTracking({ shopName })

    const { storeConfiguration, updateStoreConfiguration } =
        useAiAgentStoreConfigurationContext()

    const gorgiasChatIntegrations = useAppSelector(
        getGorgiasChatIntegrationsByStoreName(shopName),
    )

    const appId = useMemo(
        () => gorgiasChatIntegrations?.meta.app_id || '',
        [gorgiasChatIntegrations?.meta.app_id],
    )

    const primaryLanguage = getPrimaryLanguageFromChatConfig(
        gorgiasChatIntegrations?.meta,
    )

    const canUpdateTexts =
        storeConfiguration?.monitoredChatIntegrations.length === 1

    const { texts, translations } = useTexts({
        appId,
        primaryLanguage,
        shouldFetch: canUpdateTexts,
    })

    const primaryLanguageTexts = texts[primaryLanguage as keyof typeof texts]
    const needHelpTextInitialValue =
        get(primaryLanguageTexts, 'sspTexts.needHelp') || ''

    const methods = useForm<CustomerEngagementData>({
        values: {
            isConversationStartersEnabled:
                storeConfiguration?.isConversationStartersEnabled ?? false,
            isConversationStartersDesktopOnly:
                storeConfiguration?.isConversationStartersDesktopOnly ?? false,
            isAskAnythingInputEnabled:
                storeConfiguration?.floatingChatInputConfiguration?.isEnabled ??
                false,
            isFloatingInputDesktopOnly:
                storeConfiguration?.floatingChatInputConfiguration
                    ?.isDesktopOnly ?? false,
            needHelpText: needHelpTextInitialValue ?? '',
            isSalesHelpOnSearchEnabled:
                storeConfiguration?.isSalesHelpOnSearchEnabled ?? false,
            embeddedSpqEnabled: storeConfiguration?.embeddedSpqEnabled ?? false,
        },
        mode: 'onChange',
        resolver: zodResolver(customerEngagementSchema),
    })

    const {
        handleSubmit,
        reset,
        formState: { isDirty, isSubmitting },
    } = methods

    const onSave = useCallback(
        async (data: CustomerEngagementData) => {
            if (storeConfiguration) {
                try {
                    await updateStoreConfiguration({
                        ...storeConfiguration,
                        isConversationStartersEnabled:
                            data.isConversationStartersEnabled,
                        isConversationStartersDesktopOnly:
                            data.isConversationStartersDesktopOnly,
                        floatingChatInputConfiguration: {
                            ...storeConfiguration?.floatingChatInputConfiguration,
                            isEnabled: data.isAskAnythingInputEnabled,
                            isDesktopOnly: data.isFloatingInputDesktopOnly,
                            needHelpText: data.needHelpText || undefined,
                        },
                        isSalesHelpOnSearchEnabled:
                            data.isSalesHelpOnSearchEnabled,
                        embeddedSpqEnabled: data.embeddedSpqEnabled,
                    })

                    if (canUpdateTexts) {
                        const primaryLanguageTexts =
                            texts[primaryLanguage as keyof typeof texts]

                        const mergedData = {
                            ...texts,
                            [primaryLanguage]: {
                                ...primaryLanguageTexts,
                                sspTexts: {
                                    ...primaryLanguageTexts.sspTexts,
                                    needHelp: data.needHelpText || undefined,
                                },
                            },
                        }

                        await IntegrationsActions.updateApplicationTexts(
                            appId,
                            mergedData,
                        )
                    }

                    reset(data, { keepDirty: false })

                    void dispatch(
                        notify({
                            message: CHANGES_SAVED_SUCCESS,
                            status: NotificationStatus.Success,
                        }),
                    )

                    onShoppingAssistantCustomerEngagementUpdated({
                        customerEngagementSetting: {
                            triggerOnSearch: data.isSalesHelpOnSearchEnabled
                                ? 'on'
                                : 'off',
                            suggestedProductQuestion:
                                data.isConversationStartersEnabled
                                    ? 'on'
                                    : 'off',
                            askAnythingInput: data.isAskAnythingInputEnabled
                                ? 'on'
                                : 'off',
                        },
                    })
                } catch {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message:
                                'Failed to save customer engagement configuration state',
                        }),
                    )
                }
            }
        },
        [
            canUpdateTexts,
            updateStoreConfiguration,
            storeConfiguration,
            dispatch,
            texts,
            primaryLanguage,
            appId,
            reset,
            onShoppingAssistantCustomerEngagementUpdated,
        ],
    )

    useEffectOnce(() => {
        onShoppingAssistantCustomerEngagementViewed()
    })

    const saveButton = (
        <Button
            isDisabled={!isDirty || isSubmitting}
            onClick={handleSubmit(onSave)}
            intent="primary"
            type="submit"
        >
            Save Changes
        </Button>
    )

    return (
        <>
            <UnsavedChangesPrompt
                onSave={handleSubmit(onSave)}
                when={isDirty}
                onDiscard={reset}
                shouldRedirectAfterSave
            />

            <AiAgentLayout
                className={css.container}
                shopName={shopName}
                title={SALES}
                titleChildren={saveButton}
            >
                <FormProvider {...methods}>
                    <CustomerEngagementSettings
                        primaryLanguage={primaryLanguage}
                        translations={translations}
                        onSave={onSave}
                    />
                </FormProvider>
            </AiAgentLayout>
        </>
    )
}
