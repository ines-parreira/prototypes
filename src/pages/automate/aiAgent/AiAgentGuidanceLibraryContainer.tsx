import React from 'react'
import {useParams} from 'react-router-dom'
import Loader from 'pages/common/components/Loader/Loader'
import {useAiAgentHelpCenter} from './hooks/useAiAgentHelpCenter'
import {AiAgentLayout} from './components/AiAgentLayout/AiAgentLayout'
import css from './AiAgentGuidanceLibraryContainer.less'
import {AiAgentGuidanceLibrary} from './AiAgentGuidanceLibrary'

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
