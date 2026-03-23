import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useFormContext } from 'react-hook-form'
import { useParams } from 'react-router'

import { Box } from '@gorgias/axiom'

import type { CustomerEngagementData } from 'pages/aiAgent/AiAgentCustomerEngagement'
import { EmbeddedSpqsSettings } from 'pages/aiAgent/components/CustomerEngagementSettings/EmbeddedSpqsSettings'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { TrialManageWorkflow } from 'pages/aiAgent/trial/components/TrialManageWorkflow/TrialManageWorkflow'
import { useStoreIntegrationByShopName } from 'pages/settings/helpCenter/hooks/useStoreIntegrationByShopName'

import AiShoppingAssistantExpireBanner from '../AiShoppingAssistantExpireBanner'
import { ConversationLauncherSettings } from './ConversationLauncherSettings'
import { ConversationStartersSettings } from './ConversationStartersSettings'
import { useGmvUsdOver30Days } from './hooks/useGmvUsdOver30Days'
import { TriggerOnSearchSettings } from './TriggerOnSearchSettings'

import css from './CustomerEngagementSettings.less'

interface CustomerEngagementSettingsProps {
    primaryLanguage: string
    translations: Record<string, any>
    onSave: (data: CustomerEngagementData) => Promise<void>
}

export const CustomerEngagementSettings = ({
    primaryLanguage,
    translations,
    onSave,
}: CustomerEngagementSettingsProps) => {
    const { storeConfiguration } = useAiAgentStoreConfigurationContext()

    const { shopName } = useParams<{
        shopName: string
    }>()

    const { handleSubmit } = useFormContext<CustomerEngagementData>()

    const isAiShoppingAssistantEnabled = useFlag(
        FeatureFlagKey.AiShoppingAssistantEnabled,
    )

    const isSpqSettingsEnabled = useFlag(FeatureFlagKey.EmbeddedSpqSettings)

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

                    {isSpqSettingsEnabled && (
                        <EmbeddedSpqsSettings shopName={shopName} />
                    )}

                    <ConversationStartersSettings
                        isEnabled={isAiShoppingAssistantEnabled}
                        gmv={gmv}
                        isGmvLoading={isGmvLoading}
                        onAdvancedSettingsSave={handleSubmit(onSave)}
                    />

                    {(!isTriggerOnSearchDisabled ||
                        initialIsSalesHelpOnSearchEnabled) && (
                        <TriggerOnSearchSettings
                            gmv={gmv}
                            isGmvLoading={isGmvLoading}
                            isDisabled={isTriggerOnSearchDisabled}
                        />
                    )}

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
            </Box>
        </>
    )
}
