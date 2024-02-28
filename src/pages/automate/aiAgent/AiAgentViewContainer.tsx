import React from 'react'
import {Redirect, useParams} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'
import {AiAgentView} from './AiAgentView'

const AiAgentViewContainer = () => {
    const {shopType} = useParams<{shopType: string}>()

    const hasAutomate = useAppSelector(getHasAutomate)

    if (!hasAutomate || shopType !== 'shopify') {
        return <Redirect to="/app/automation" />
    }

    return <AiAgentView />
}

export default AiAgentViewContainer
