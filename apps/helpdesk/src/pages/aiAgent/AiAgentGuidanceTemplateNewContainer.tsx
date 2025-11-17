import { Redirect, useParams } from 'react-router-dom'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'

import { AiAgentGuidanceTemplateNewView } from './AiAgentGuidanceTemplateNewView'
import { AiAgentLayout } from './components/AiAgentLayout/AiAgentLayout'
import { useAiAgentHelpCenter } from './hooks/useAiAgentHelpCenter'
import { useAiAgentNavigation } from './hooks/useAiAgentNavigation'
import { useGuidanceTemplate } from './hooks/useGuidanceTemplate'

import css from './AiAgentMainViewContainer.less'

export const AiAgentGuidanceTemplateNewContainer = () => {
    const { shopType, shopName, templateId } = useParams<{
        shopType: string
        shopName: string
        templateId: string
    }>()
    const { routes } = useAiAgentNavigation({ shopName })
    const guidanceHelpCenter = useAiAgentHelpCenter({
        shopName,
        helpCenterType: 'guidance',
    })
    const { guidanceTemplate } = useGuidanceTemplate(templateId)

    const { guidanceActions, isLoading: isLoadingActions } =
        useGetGuidancesAvailableActions(shopName, shopType)

    if (!guidanceTemplate) {
        return <Redirect to={routes.guidanceTemplates} />
    }

    if (!guidanceHelpCenter || isLoadingActions) {
        return (
            <div className={css.spinner}>
                <LoadingSpinner size="big" />
            </div>
        )
    }

    return (
        <AiAgentLayout title={'Knowledge'} shopName={shopName}>
            <AiAgentGuidanceTemplateNewView
                guidanceHelpCenterId={guidanceHelpCenter.id}
                locale={guidanceHelpCenter.default_locale}
                shopName={shopName}
                guidanceTemplate={guidanceTemplate}
                availableActions={guidanceActions}
            />
        </AiAgentLayout>
    )
}
