import React from 'react'
import {Redirect} from 'react-router-dom'

import {useFlags} from 'launchdarkly-react-client-sdk'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'

import {FeatureFlagKey} from 'config/featureFlags'
import DEPRECATED_ConnectedChannelsView from './DEPRECATED_ConnectedChannelsView'
import {ConnectedChannelsView} from './ConnectedChannelsView'

const ConnectedChannelsViewContainer = () => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const isNewChannelsViewEnabled = useFlags()[FeatureFlagKey.NewChannelsView]

    if (!hasAutomate) {
        return <Redirect to="/app/automation/connected-channels" />
    }

    if (isNewChannelsViewEnabled) {
        return <ConnectedChannelsView />
    }

    if (isNewChannelsViewEnabled === false) {
        return <DEPRECATED_ConnectedChannelsView />
    }
    return null
}

export default ConnectedChannelsViewContainer
