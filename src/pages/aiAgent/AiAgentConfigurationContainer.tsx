import React from 'react'
import {useParams} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'

import {AiAgentConfigurationView} from './AiAgentConfigurationView/AiAgentConfigurationView'

const AiAgentConfigurationContainer = () => {
    const {shopName, shopType} = useParams<{
        shopName: string
        shopType: string
    }>()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    return (
        <AiAgentConfigurationView
            accountDomain={accountDomain}
            shopName={shopName}
            shopType={shopType}
        />
    )
}

export default AiAgentConfigurationContainer
