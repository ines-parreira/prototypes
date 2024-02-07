import React, {useEffect} from 'react'

import {
    HELP_CENTER_STEPS_DESCRIPTIONS,
    HELP_CENTER_STEPS_LABELS,
    HELP_CENTER_STEPS_TITLES,
} from 'pages/settings/helpCenter/constants'
import WizardStepSkeleton from 'pages/common/components/wizard/WizardStepSkeleton'
import {HelpCenter, HelpCenterCreationWizardStep} from 'models/helpCenter/types'
import {GorgiasChatIntegration, IntegrationType} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'
import {
    getIntegrationsByType,
    getIntegrationsByTypes,
} from 'state/integrations/selectors'
import useHelpCenterAutomationSettings from 'pages/automate/common/hooks/useHelpCenterAutomationSettings'
import HelpCenterWizardOrderManagement from '../HelpCenterWizardOrderManagement/HelpCenterWizardOrderManagement'
import {useHelpCenterAutomationForm} from '../../hooks/useHelpCenterAutomationForm'
import HelpCenterWizardArticleRec from '../HelpCenterWizardArticleRec/HelpCenterWizardArticleRec'
import HelpCenterWizardFlows from '../HelpCenterWizardFlows/HelpCenterWizardFlows'
import HelpCenterWizardAutomationPreview from '../HelpCenterWizardAutomationPreview/HelpCenterWizardAutomationPreview'
import css from './HelpCenterCreationWizardStepAutomate.less'

const FLOWS_SMALL_LIMIT = 2
const FLOWS_BIG_LIMIT = 8

type Props = {
    helpCenter: HelpCenter
    isUpdate: boolean
}

const HelpCenterCreationWizardStepAutomate: React.FC<Props> = ({
    helpCenter,
}) => {
    const {
        state,
        updateOrderManagementEnabled,
        updateArticleRecommendationEnabled,
        updateChatIntegrationId,
        updateFlows,
    } = useHelpCenterAutomationForm({
        orderManagementEnabled:
            helpCenter.self_service_deactivated_datetime !== null,
    })
    const chatIntegrations = useAppSelector(
        getIntegrationsByType<GorgiasChatIntegration>(
            IntegrationType.GorgiasChat
        )
    )
    const {automationSettings, isFetchPending} =
        useHelpCenterAutomationSettings(helpCenter.id)

    useEffect(() => {
        const helpCenterFlows = automationSettings.workflows
        if (!isFetchPending && helpCenterFlows) {
            updateFlows(
                helpCenterFlows.map((flow) => ({
                    workflow_id: flow.id,
                    enabled: flow.enabled,
                }))
            )
        }
    }, [automationSettings.workflows, isFetchPending, updateFlows])

    const integrations = useAppSelector(
        getIntegrationsByTypes([
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ])
    )
    const helpCenterShopIntegration = integrations.find(
        (integration) => integration.name === helpCenter.shop_name
    )

    const isArticleRecommendationEnabled = chatIntegrations.length > 0

    return (
        <WizardStepSkeleton
            step={HelpCenterCreationWizardStep.Automate}
            labels={HELP_CENTER_STEPS_LABELS}
            titles={HELP_CENTER_STEPS_TITLES}
            descriptions={HELP_CENTER_STEPS_DESCRIPTIONS}
            footer={<div>Footer</div>}
            preview={
                helpCenterShopIntegration && (
                    <HelpCenterWizardAutomationPreview
                        shopType={helpCenterShopIntegration.type}
                        shopName={helpCenterShopIntegration.name}
                        helpCenter={helpCenter}
                        flows={state.flows}
                        orderManagementEnabled={state.orderManagementEnabled}
                    />
                )
            }
        >
            <div className={css.container}>
                <HelpCenterWizardOrderManagement
                    onChange={updateOrderManagementEnabled}
                    enabled={state.orderManagementEnabled}
                />
                {isArticleRecommendationEnabled && (
                    <HelpCenterWizardArticleRec
                        articleRecommendationEnabled={
                            state.articleRecommendationEnabled
                        }
                        chatIntegrations={chatIntegrations}
                        onArticleRecommendationEnabledChange={
                            updateArticleRecommendationEnabled
                        }
                        selectedChatId={state.chatIntegrationId}
                        onChatApplicationIdChange={updateChatIntegrationId}
                    />
                )}

                {helpCenterShopIntegration && (
                    <HelpCenterWizardFlows
                        helpCenterId={helpCenter.id}
                        shopType={helpCenterShopIntegration.type}
                        shopName={helpCenterShopIntegration.name}
                        supportedLocales={helpCenter.supported_locales}
                        flows={state.flows}
                        onChange={updateFlows}
                        isLoading={isFetchPending}
                        flowLimits={
                            isArticleRecommendationEnabled
                                ? FLOWS_SMALL_LIMIT
                                : FLOWS_BIG_LIMIT
                        }
                    />
                )}
            </div>
        </WizardStepSkeleton>
    )
}

export default HelpCenterCreationWizardStepAutomate
