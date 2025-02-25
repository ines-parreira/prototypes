import React from 'react'

import { Redirect } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { getHasAutomate } from 'state/billing/selectors'

import { ConnectedChannelsView } from './ConnectedChannelsView'

const ConnectedChannelsViewContainer = () => {
    const hasAutomate = useAppSelector(getHasAutomate)

    if (!hasAutomate) {
        return <Redirect to="/app/automation/connected-channels" />
    }

    return <ConnectedChannelsView />
}

export default ConnectedChannelsViewContainer
