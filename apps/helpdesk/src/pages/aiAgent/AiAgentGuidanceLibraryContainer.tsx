import { useParams } from 'react-router-dom'

import { LoadingSpinner } from '@gorgias/axiom'

import { AiAgentGuidanceLibrary } from './AiAgentGuidanceLibrary'
import { AiAgentLayout } from './components/AiAgentLayout/AiAgentLayout'
import { GUIDANCE } from './constants'
import { useAiAgentHelpCenter } from './hooks/useAiAgentHelpCenter'

import css from './AiAgentGuidanceLibraryContainer.less'

export const AiAgentGuidanceLibraryContainer = () => {
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
            shopName={shopName}
            className={css.container}
            title={GUIDANCE}
        >
            <AiAgentGuidanceLibrary
                helpCenterId={guidanceHelpCenter.id}
                shopName={shopName}
            />
        </AiAgentLayout>
    )
}
