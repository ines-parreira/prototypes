import { useParams } from 'react-router-dom'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { AiAgentGuidanceAiSuggestionNewView } from './AiAgentGuidanceAiSuggestionNewView'
import { AiAgentLayout } from './components/AiAgentLayout/AiAgentLayout'
import { GuidanceBreadcrumbs } from './components/GuidanceBreadcrumbs/GuidanceBreadcrumbs'
import { useAiAgentHelpCenter } from './hooks/useAiAgentHelpCenter'

import css from './AiAgentGuidanceContainer.less'

export const AiAgentGuidanceAiSuggestionNewContainer = () => {
    const { shopType, shopName, aiGuidanceId } = useParams<{
        shopType: string
        shopName: string
        aiGuidanceId: string
    }>()
    const guidanceHelpCenter = useAiAgentHelpCenter({
        shopName,
        helpCenterType: 'guidance',
    })

    if (!guidanceHelpCenter) {
        return (
            <div className={css.spinner}>
                <LoadingSpinner size="big" />
            </div>
        )
    }

    return (
        <AiAgentLayout
            title={
                <GuidanceBreadcrumbs shopName={shopName} title="New guidance" />
            }
            shopName={shopName}
        >
            <AiAgentGuidanceAiSuggestionNewView
                guidanceHelpCenterId={guidanceHelpCenter.id}
                locale={guidanceHelpCenter.default_locale}
                shopName={shopName}
                shopType={shopType}
                aiGuidanceId={aiGuidanceId}
            />
        </AiAgentLayout>
    )
}
