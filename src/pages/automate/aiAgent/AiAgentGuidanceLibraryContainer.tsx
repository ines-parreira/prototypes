import React from 'react'
import {useParams} from 'react-router-dom'

import Spinner from 'pages/common/components/Spinner'

import {AiAgentGuidanceLibrary} from './AiAgentGuidanceLibrary'
import css from './AiAgentGuidanceLibraryContainer.less'
import {AiAgentLayout} from './components/AiAgentLayout/AiAgentLayout'
import {useAiAgentHelpCenter} from './hooks/useAiAgentHelpCenter'

export const AiAgentGuidanceLibraryContainer = () => {
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
                <Spinner size="big" />
            </div>
        )
    }

    return (
        <AiAgentLayout shopName={shopName} className={css.container}>
            <AiAgentGuidanceLibrary
                helpCenterId={guidanceHelpCenter.id}
                shopName={shopName}
            />
        </AiAgentLayout>
    )
}
