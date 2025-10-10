import { useCallback, useMemo } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { FeatureFlagKey } from '@repo/feature-flags'
import { get } from 'lodash'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router'
import { z } from 'zod'

import { Box, LegacyButton as Button } from '@gorgias/axiom'

import { getPrimaryLanguageFromChatConfig } from 'config/integrations/gorgias_chat'
import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { CHANGES_SAVED_SUCCESS } from 'pages/aiAgent/constants'
import { useShoppingAssistantTracking } from 'pages/aiAgent/hooks/useShoppingAssistantTracking'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { TrialManageWorkflow } from 'pages/aiAgent/trial/components/TrialManageWorkflow/TrialManageWorkflow'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import { useStoreIntegrationByShopName } from 'pages/settings/helpCenter/hooks/useStoreIntegrationByShopName'
import * as IntegrationsActions from 'state/integrations/actions'
import { getGorgiasChatIntegrationsByStoreName } from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import AiShoppingAssistantExpireBanner from '../AiShoppingAssistantExpireBanner'
import { ConversationLauncherSettings } from './ConversationLauncherSettings'
import { ConversationStartersSettings } from './ConversationStartersSettings'
import { useGmvUsdOver30Days } from './hooks/useGmvUsdOver30Days'
import { useTexts } from './hooks/useTexts'
import { TriggerOnSearchSettings } from './TriggerOnSearchSettings'

import css from './CustomerEngagementSettings.less'

const customerEngagementSchema = z.object({
    isConversationStartersEnabled: z.boolean(),
    isAskAnythingInputEnabled: z.boolean(),
    isFloatingInputDesktopOnly: z.boolean(),
    isSalesHelpOnSearchEnabled: z.boolean(),
    needHelpText: z.string(),
})

type CustomerEngagementData = z.infer<typeof customerEngagementSchema>

export const CustomerEngagementSettings = () => {
    const dispatch = useAppDispatch()
    const { storeConfiguration, updateStoreConfiguration } =
        useAiAgentStoreConfigurationContext()

    const { shopName } = useParams<{
        shopName: string
    }>()

    const { onShoppingAssistantCustomerEngagementUpdated } =
        useShoppingAssistantTracking({ shopName })

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

    const isAiShoppingAssistantEnabled = useFlag(
        FeatureFlagKey.AiShoppingAssistantEnabled,
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
            isAskAnythingInputEnabled:
                storeConfiguration?.floatingChatInputConfiguration?.isEnabled ??
                false,
            isFloatingInputDesktopOnly:
                storeConfiguration?.floatingChatInputConfiguration
                    ?.isDesktopOnly ?? false,
            needHelpText: needHelpTextInitialValue ?? '',
            isSalesHelpOnSearchEnabled:
                storeConfiguration?.isSalesHelpOnSearchEnabled ?? false,
        },
        mode: 'onChange',
        resolver: zodResolver(customerEngagementSchema),
    })

    const {
        handleSubmit,
        reset,
        formState: { isSubmitting, isDirty },
    } = methods

    const onSave = useCallback(
        async (data: CustomerEngagementData) => {
            if (storeConfiguration) {
                try {
                    await updateStoreConfiguration({
                        ...storeConfiguration,
                        isConversationStartersEnabled:
                            data.isConversationStartersEnabled,
                        floatingChatInputConfiguration: {
                            ...storeConfiguration?.floatingChatInputConfiguration,
                            isEnabled: data.isAskAnythingInputEnabled,
                            isDesktopOnly: data.isFloatingInputDesktopOnly,
                            needHelpText: data.needHelpText || undefined,
                        },
                        isSalesHelpOnSearchEnabled:
                            data.isSalesHelpOnSearchEnabled,
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

    const storeIntegration = useStoreIntegrationByShopName(shopName)
    const { data: gmv, isLoading: isGmvLoading } = useGmvUsdOver30Days(
        storeIntegration?.id,
    )

    const isTriggerOnSearchDisabled = useFlag(
        FeatureFlagKey.TriggerOnSearchKillSwitch,
    )

    const initialIsSalesHelpOnSearchEnabled =
        storeConfiguration?.isSalesHelpOnSearchEnabled ?? false

    return (
        <>
            <UnsavedChangesPrompt
                onSave={handleSubmit(onSave)}
                when={isDirty}
                onDiscard={reset}
                shouldRedirectAfterSave
            />

            <FormProvider {...methods}>
                <Box
                    className={css.container}
                    flexDirection="column"
                    alignItems="start"
                    flexGrow={1}
                >
                    <Box
                        className={css.settingsContent}
                        flexDirection="column"
                        w="100%"
                    >
                        <AiShoppingAssistantExpireBanner
                            deactiveDatetime={
                                storeConfiguration?.salesDeactivatedDatetime ??
                                undefined
                            }
                        />
                        {storeConfiguration && (
                            <TrialManageWorkflow
                                pageName="Engagement"
                                storeConfiguration={storeConfiguration}
                            />
                        )}

                        <div data-candu-id="ai-sales-agent-customer-engagement-settings-educational-content" />

                        {(!isTriggerOnSearchDisabled ||
                            initialIsSalesHelpOnSearchEnabled) && (
                            <TriggerOnSearchSettings
                                gmv={gmv}
                                isGmvLoading={isGmvLoading}
                                isDisabled={isTriggerOnSearchDisabled}
                            />
                        )}
                        <ConversationStartersSettings
                            isEnabled={isAiShoppingAssistantEnabled}
                            gmv={gmv}
                            isGmvLoading={isGmvLoading}
                        />
                        {isAiShoppingAssistantEnabled && (
                            <ConversationLauncherSettings
                                gmv={gmv}
                                isGmvLoading={isGmvLoading}
                                primaryLanguage={primaryLanguage}
                                translations={translations}
                                onAdvancedSettingsSave={handleSubmit(onSave)}
                            />
                        )}
                    </Box>

                    <Button
                        className={css.saveButton}
                        isDisabled={!isDirty || isSubmitting}
                        onClick={handleSubmit(onSave)}
                        intent="primary"
                        type="submit"
                    >
                        Save Changes
                    </Button>
                </Box>
            </FormProvider>
        </>
    )
}
