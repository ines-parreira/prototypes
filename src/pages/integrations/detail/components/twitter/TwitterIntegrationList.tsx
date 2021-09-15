import React from 'react'

import {List, Map} from 'immutable'

import IntegrationList from '../IntegrationList'

import {
    activateIntegration,
    deactivateIntegration,
} from '../../../../../state/integrations/actions'

import {IntegrationType} from '../../../../../models/integration/types'

import twitterWhiteIcon from '../../../../../../img/integrations/twitter-white.svg'

import TwitterIntegrationListItem from './TwitterIntegrationListItem'

import css from './TwitterIntegrationList.less'

type Props = {
    actions: {
        activateIntegration: typeof activateIntegration
        deactivateIntegration: typeof deactivateIntegration
    }
    integrations: List<Map<string, string>>
    loading: Map<string, string>
    redirectUri: string
}

export default function TwitterIntegrationList({
    integrations,
    loading,
    actions,
    redirectUri,
}: Props): JSX.Element {
    const twitterIntegrations = integrations.filter(
        (v) => v?.get('type') === IntegrationType.TwitterIntegrationType
    ) as List<Map<any, any>>

    const longTypeDescription =
        'Create tickets when customers interact with you via replies, mentions, or direct messages on Twitter.'

    const integrationToItemDisplay = (integration: Map<string, string>) => (
        <TwitterIntegrationListItem
            integration={integration}
            actions={actions}
        />
    )

    return (
        <IntegrationList
            longTypeDescription={longTypeDescription}
            integrationType={IntegrationType.TwitterIntegrationType}
            integrations={twitterIntegrations}
            createIntegration={() => (window.location.href = redirectUri)}
            createIntegrationButtonContent={
                <div>
                    <img
                        src={twitterWhiteIcon}
                        alt="twitter-logo"
                        className={css.twitterLogo}
                    />
                    Login with Twitter
                </div>
            }
            createIntegrationButtonClassName={css.createIntegrationButton}
            integrationToItemDisplay={integrationToItemDisplay}
            loading={loading}
        />
    )
}
