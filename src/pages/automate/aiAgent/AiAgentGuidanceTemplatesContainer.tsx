import {LoadingSpinner} from '@gorgias/merchant-ui-kit'
import React from 'react'
import {useParams} from 'react-router-dom'

import css from './AiAgentGuidanceTemplatesContainer.less'

import {AiAgentGuidanceTemplatesView} from './AiAgentGuidanceTemplatesView'
import {AiAgentLayout} from './components/AiAgentLayout/AiAgentLayout'
import {useAiAgentHelpCenter} from './hooks/useAiAgentHelpCenter'

export const AiAgentGuidanceTemplatesContainer = () => {
    const {shopName} = useParams<{
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
        <AiAgentLayout shopName={shopName} className={css.container}>
            <AiAgentGuidanceTemplatesView shopName={shopName} />
        </AiAgentLayout>
    )
}
