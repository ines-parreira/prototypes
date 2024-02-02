import React from 'react'

import {
    HELP_CENTER_STEPS_DESCRIPTIONS,
    HELP_CENTER_STEPS_LABELS,
    HELP_CENTER_STEPS_TITLES,
} from 'pages/settings/helpCenter/constants'
import WizardStepSkeleton from 'pages/common/components/wizard/WizardStepSkeleton'
import {HelpCenter, HelpCenterCreationWizardStep} from 'models/helpCenter/types'
import {GorgiasChatIntegration, IntegrationType} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationsByType} from 'state/integrations/selectors'
import HelpCenterWizardOrderManagement from '../HelpCenterWizardOrderManagement/HelpCenterWizardOrderManagement'
import {useHelpCenterAutomationForm} from '../../hooks/useHelpCenterAutomationForm'
import HelpCenterWizardArticleRec from '../HelpCenterWizardArticleRec/HelpCenterWizardArticleRec'
import css from './HelpCenterCreationWizardStepAutomate.less'

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
    } = useHelpCenterAutomationForm({
        orderManagementEnabled:
            helpCenter.self_service_deactivated_datetime !== null,
    })
    const chatIntegrations = useAppSelector(
        getIntegrationsByType<GorgiasChatIntegration>(
            IntegrationType.GorgiasChat
        )
    )

    return (
        <WizardStepSkeleton
            step={HelpCenterCreationWizardStep.Automate}
            labels={HELP_CENTER_STEPS_LABELS}
            titles={HELP_CENTER_STEPS_TITLES}
            descriptions={HELP_CENTER_STEPS_DESCRIPTIONS}
            footer={<div>Footer</div>}
        >
            <div className={css.container}>
                <HelpCenterWizardOrderManagement
                    onChange={updateOrderManagementEnabled}
                    enabled={state.orderManagementEnabled}
                />
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
            </div>
        </WizardStepSkeleton>
    )
}

export default HelpCenterCreationWizardStepAutomate
