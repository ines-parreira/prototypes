import { useLocation, useParams } from 'react-router-dom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'

import AutomatePaywallView from '../common/components/AutomatePaywallView'
import { AutomateFeatures } from '../common/types'
import TrainMyAiView from './TrainMyAiView'

const TrainMyAiViewContainer = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()
    const { key } = useLocation()
    const { hasAccess } = useAiAgentAccess(shopName)

    if (!hasAccess) {
        return (
            <AutomatePaywallView automateFeature={AutomateFeatures.Automate} />
        )
    }

    return <TrainMyAiView key={key} />
}

export default TrainMyAiViewContainer
