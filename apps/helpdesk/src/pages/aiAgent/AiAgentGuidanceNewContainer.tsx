import { useParams } from 'react-router-dom'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'

import { AiAgentGuidanceNewView } from './AiAgentGuidanceNewView'
import { AiAgentLayout } from './components/AiAgentLayout/AiAgentLayout'
import { useAiAgentHelpCenter } from './hooks/useAiAgentHelpCenter'

import css from './AiAgentMainViewContainer.less'

export const AiAgentGuidanceNewContainer = () => {
    const { shopType, shopName } = useParams<{
        shopType: string
        shopName: string
    }>()
    const guidanceHelpCenter = useAiAgentHelpCenter({
        shopName,
        helpCenterType: 'guidance',
    })

    const { guidanceActions, isLoading: isLoadingActions } =
        useGetGuidancesAvailableActions(shopName, shopType)

    if (!guidanceHelpCenter || isLoadingActions) {
        return (
            <div className={css.spinner}>
                <LoadingSpinner size="big" />
            </div>
        )
    }

    return (
        <AiAgentLayout title={'Knowledge'} shopName={shopName}>
            <AiAgentGuidanceNewView
                shopName={shopName}
                availableActions={guidanceActions}
                helpCenter={guidanceHelpCenter}
            />
        </AiAgentLayout>
    )
}
