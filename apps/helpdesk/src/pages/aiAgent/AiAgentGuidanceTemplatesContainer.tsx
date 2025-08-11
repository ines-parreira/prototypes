import { useParams } from 'react-router-dom'

import { LoadingSpinner } from '@gorgias/axiom'

import { AiAgentGuidanceTemplatesView } from './AiAgentGuidanceTemplatesView'
import { AiAgentLayout } from './components/AiAgentLayout/AiAgentLayout'
import { GUIDANCE } from './constants'
import { useAiAgentHelpCenter } from './hooks/useAiAgentHelpCenter'

import css from './AiAgentGuidanceTemplatesContainer.less'

export const AiAgentGuidanceTemplatesContainer = () => {
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
            <AiAgentGuidanceTemplatesView shopName={shopName} />
        </AiAgentLayout>
    )
}
