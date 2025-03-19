import { Redirect, useParams } from 'react-router-dom'

import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { AiAgentGuidanceDetailView } from './AiAgentGuidanceDetailView'
import { useAiAgentHelpCenter } from './hooks/useAiAgentHelpCenter'
import { useAiAgentNavigation } from './hooks/useAiAgentNavigation'

import css from './AiAgentGuidanceContainer.less'

export const AiAgentGuidanceDetailContainer = () => {
    const { shopName, articleId } = useParams<{
        shopName: string
        articleId: string
    }>()
    const guidanceHelpCenter = useAiAgentHelpCenter({
        shopName,
        helpCenterType: 'guidance',
    })
    const { routes } = useAiAgentNavigation({ shopName })

    const guidanceArticleId = Number(articleId)

    if (isNaN(guidanceArticleId)) {
        return <Redirect to={routes.guidance} />
    }

    if (!guidanceHelpCenter) {
        return (
            <div className={css.spinner}>
                <LoadingSpinner size="big" />
            </div>
        )
    }

    return (
        <AiAgentGuidanceDetailView
            shopName={shopName}
            locale={guidanceHelpCenter.default_locale}
            guidanceArticleId={guidanceArticleId}
            guidanceHelpCenterId={guidanceHelpCenter.id}
        />
    )
}
