import React from 'react'
import {Redirect} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {
    getHasAutomate,
    getHasLegacyAutomateFeatures,
} from 'state/billing/selectors'

import ConnectedChannelsView from './ConnectedChannelsView'

const ConnectedChannelsViewContainer = () => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const hasLegacyAutomateFeatures = useAppSelector(
        getHasLegacyAutomateFeatures
    )

    if (!hasAutomate && !hasLegacyAutomateFeatures) {
        return <Redirect to="/app/automation/connected-channels" />
    }

    return <ConnectedChannelsView />
}

export default ConnectedChannelsViewContainer
