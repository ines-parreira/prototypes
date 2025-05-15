import { useCallback } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router'
import { z } from 'zod'

import { Box, Button } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import { CHANGES_SAVED_SUCCESS } from 'pages/aiAgent/constants'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import { useStoreIntegrationByShopName } from 'pages/settings/helpCenter/hooks/useStoreIntegrationByShopName'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import AiShoppingAssistantExpireBanner from '../AiShoppingAssistantExpireBanner'
import { ConversationLauncherSettings } from './ConversationLauncherSettings'
import { ConversationStartersSettings } from './ConversationStartersSettings'
import { useGmvUsdOver30Days } from './hooks/useGmvUsdOver30Days'
import { TriggerOnSearchSettings } from './TriggerOnSearchSettings'

import css from './CustomerEngagementSettings.less'

const customerEngagementSchema = z.object({
    isConversationStartersEnabled: z.boolean(),
    isFloatingInputEnabled: z.boolean(),
    isFloatingInputDesktopOnly: z.boolean(),
    isSalesHelpOnSearchEnabled: z.boolean(),
})

type CustomerEngagementData = z.infer<typeof customerEngagementSchema>

export const CustomerEngagementSettings = () => {
    const dispatch = useAppDispatch()
    const { storeConfiguration, updateStoreConfiguration } =
        useAiAgentStoreConfigurationContext()

    const flags = useFlags()
    const isConversationStartersFeatureEnabled =
        flags[FeatureFlagKey.ConversationStarters]

    const isConvertFloatingChatInputFeatureEnabled =
        flags[FeatureFlagKey.ConvertFloatingChatInput]
    const isTriggerOnSearchEnabled =
        !!flags[FeatureFlagKey.AiSalesAgentHelpOnSearchTemplateQuery]

    const methods = useForm<CustomerEngagementData>({
        values: {
            isConversationStartersEnabled:
                storeConfiguration?.isConversationStartersEnabled ?? false,
            isFloatingInputEnabled:
                storeConfiguration?.floatingChatInputConfiguration?.isEnabled ??
                false,
            isFloatingInputDesktopOnly:
                storeConfiguration?.floatingChatInputConfiguration
                    ?.isDesktopOnly ?? false,
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
                            isEnabled: data.isFloatingInputEnabled,
                            isDesktopOnly: data.isFloatingInputDesktopOnly,
                        },
                        isSalesHelpOnSearchEnabled:
                            data.isSalesHelpOnSearchEnabled,
                    })

                    void dispatch(
                        notify({
                            message: CHANGES_SAVED_SUCCESS,
                            status: NotificationStatus.Success,
                        }),
                    )
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
        [updateStoreConfiguration, storeConfiguration, dispatch],
    )

    const { shopName } = useParams<{
        shopName: string
    }>()
    const storeIntegration = useStoreIntegrationByShopName(shopName)
    const { data: gmv, isLoading: isGmvLoading } = useGmvUsdOver30Days(
        storeIntegration?.id,
    )

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
                    flexGrow={1}
                >
                    <div className={css.bannerContainer}>
                        <AiShoppingAssistantExpireBanner
                            deactiveDatetime={
                                storeConfiguration?.salesDeactivatedDatetime ??
                                undefined
                            }
                        />
                    </div>
                    {isTriggerOnSearchEnabled && (
                        <TriggerOnSearchSettings
                            gmv={gmv}
                            isGmvLoading={isGmvLoading}
                        />
                    )}
                    <ConversationStartersSettings
                        isEnabled={isConversationStartersFeatureEnabled}
                        gmv={gmv}
                        isGmvLoading={isGmvLoading}
                    />
                    {isConvertFloatingChatInputFeatureEnabled && (
                        <ConversationLauncherSettings
                            gmv={gmv}
                            isGmvLoading={isGmvLoading}
                        />
                    )}
                    <Box className={css.saveButtonWrapper}>
                        <Button
                            isDisabled={!isDirty || isSubmitting}
                            onClick={handleSubmit(onSave)}
                            intent="primary"
                            type="submit"
                        >
                            Save Changes
                        </Button>
                    </Box>
                </Box>
            </FormProvider>
        </>
    )
}
