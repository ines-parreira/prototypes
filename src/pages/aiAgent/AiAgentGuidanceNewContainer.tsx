import { useParams } from 'react-router-dom'

import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { AiAgentGuidanceNewView } from './AiAgentGuidanceNewView'
import { AiAgentLayout } from './components/AiAgentLayout/AiAgentLayout'
import { GuidanceBreadcrumbs } from './components/GuidanceBreadcrumbs/GuidanceBreadcrumbs'
import { useAiAgentHelpCenter } from './hooks/useAiAgentHelpCenter'

import css from './AiAgentMainViewContainer.less'

export const AiAgentGuidanceNewContainer = () => {
    const { shopName } = useParams<{
        shopName: string
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
            <AiAgentGuidanceNewView
                shopName={shopName}
                helpCenter={guidanceHelpCenter}
            />
        </AiAgentLayout>
    )
}
