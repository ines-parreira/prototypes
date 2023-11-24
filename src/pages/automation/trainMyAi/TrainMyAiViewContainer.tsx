import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'

import AutomatePaywallView from '../common/components/AutomatePaywallView'
import {AutomateFeatures} from '../common/types'
import TrainMyAiView from './TrainMyAiView'

const TrainMyAiViewContainer = () => {
    const hasAutomate = useAppSelector(getHasAutomate)

    if (!hasAutomate) {
        return (
            <AutomatePaywallView automateFeature={AutomateFeatures.Automate} />
        )
    }

    return <TrainMyAiView />
}

export default TrainMyAiViewContainer
