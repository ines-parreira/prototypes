import React from 'react'
import {useParams} from 'react-router-dom'

import Loader from 'pages/common/components/Loader/Loader'

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
        return <Loader data-testid="loader" />
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
