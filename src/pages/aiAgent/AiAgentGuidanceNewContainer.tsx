import { useParams } from 'react-router-dom'

import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'

import { AiAgentGuidanceNewView } from './AiAgentGuidanceNewView'
import { AiAgentLayout } from './components/AiAgentLayout/AiAgentLayout'
import { GuidanceBreadcrumbs } from './components/GuidanceBreadcrumbs/GuidanceBreadcrumbs'
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
        <AiAgentLayout
            title={
                <GuidanceBreadcrumbs shopName={shopName} title="New guidance" />
            }
            shopName={shopName}
        >
            <AiAgentGuidanceNewView
                shopName={shopName}
                availableActions={guidanceActions}
                helpCenter={guidanceHelpCenter}
            />
        </AiAgentLayout>
    )
}
