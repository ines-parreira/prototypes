import React from 'react'
import {useParams} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {AiAgentStoreView} from './AiAgentStoreView'

const AiAgentViewContainer = () => {
    const {shopName} = useParams<{
        shopName: string
    }>()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    return (
        <AiAgentStoreView accountDomain={accountDomain} shopName={shopName} />
    )
}

export default AiAgentViewContainer
