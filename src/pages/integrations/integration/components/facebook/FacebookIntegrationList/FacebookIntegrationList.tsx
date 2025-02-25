import React from 'react'

import { Map } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import FacebookLoginButton from 'pages/integrations/integration/components/facebook/FacebookLoginButton/FacebookLoginButton'
import IntegrationList from 'pages/integrations/integration/components/IntegrationList'
import { getFacebookIntegrations } from 'state/integrations/selectors'

import FacebookPageRow from './FacebookPageRow'

type Props = {
    loading: Map<any, any>
    redirectUri: string
}

const FacebookIntegrationList = ({ loading, redirectUri }: Props) => {
    const integrations = useAppSelector(getFacebookIntegrations)

    const onLogin = () => {
        window.location.href = redirectUri
    }
    const longTypeDescription = `Facebook is a popular social network where customers can interact with companies.
This integration creates tickets when customers post on your Facebook page or send you a message on Messenger.`

    const integrationToItemDisplay = (int: Map<any, any>) => (
        <FacebookPageRow key={int.get('id')} integration={int} />
    )

    return (
        <IntegrationList
            integrationType={IntegrationType.Facebook}
            integrations={integrations}
            longTypeDescription={longTypeDescription}
            createIntegration={onLogin}
            createIntegrationButton={<FacebookLoginButton showIcon />}
            integrationToItemDisplay={integrationToItemDisplay}
            loading={loading}
        />
    )
}

export default FacebookIntegrationList
