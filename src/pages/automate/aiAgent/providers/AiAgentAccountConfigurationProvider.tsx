import React from 'react'
import {Redirect} from 'react-router-dom'
import {useGetOrCreateAccountConfiguration} from 'hooks/aiAgent/useGetOrCreateAccountConfiguration'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import Loader from 'pages/common/components/Loader/Loader'

type Props = {
    children?: React.ReactNode
}

export const AiAgentAccountConfigurationProvider = ({children}: Props) => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountId = currentAccount.get('id')
    const accountDomain = currentAccount.get('domain')

    const {status: accountConfigRetrievalStatus} =
        useGetOrCreateAccountConfiguration(
            {accountId, accountDomain},
            {refetchOnWindowFocus: false}
        )

    if (!hasAutomate || accountConfigRetrievalStatus === 'error') {
        return <Redirect to="/app/automation" />
    }

    if (accountConfigRetrievalStatus !== 'success') {
        return <Loader />
    }

    return <>{children}</>
}
