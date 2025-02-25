import React from 'react'

import { useLocation } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { getHasAutomate } from 'state/billing/selectors'

import AutomatePaywallView from '../common/components/AutomatePaywallView'
import { AutomateFeatures } from '../common/types'
import TrainMyAiView from './TrainMyAiView'

const TrainMyAiViewContainer = () => {
    const { key } = useLocation()
    const hasAutomate = useAppSelector(getHasAutomate)

    if (!hasAutomate) {
        return (
            <AutomatePaywallView automateFeature={AutomateFeatures.Automate} />
        )
    }

    return <TrainMyAiView key={key} />
}

export default TrainMyAiViewContainer
