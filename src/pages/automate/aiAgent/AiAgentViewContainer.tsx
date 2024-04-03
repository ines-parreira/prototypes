import React from 'react'
import {Redirect, useParams} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'

import useAppDispatch from 'hooks/useAppDispatch'
import Loader from 'pages/common/components/Loader/Loader'
import {useGetOrCreateAccountConfiguration} from 'hooks/aiAgent/useGetOrCreateAccountConfiguration'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {AiAgentStoreView} from './AiAgentStoreView'

const AiAgentViewContainer = () => {
    const dispatch = useAppDispatch()
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()
    const hasAutomate = useAppSelector(getHasAutomate)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountId = currentAccount.get('id')
    const accountDomain = currentAccount.get('domain')

    const {status: accountConfigRetrievalStatus} =
        useGetOrCreateAccountConfiguration({accountId, accountDomain, dispatch})

    if (
        !hasAutomate ||
        shopType !== 'shopify' ||
        accountConfigRetrievalStatus === 'error'
    ) {
        return <Redirect to="/app/automation" />
    }

    if (accountConfigRetrievalStatus !== 'success') {
        return <Loader />
    }

    return (
        <AiAgentStoreView accountDomain={accountDomain} shopName={shopName} />
    )
}

export default AiAgentViewContainer
