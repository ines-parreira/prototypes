import React from 'react'

import {List, Map} from 'immutable'

import {connect, ConnectedProps} from 'react-redux'

import IntegrationList from '../IntegrationList'

import {IntegrationType} from '../../../../../models/integration/types'

import twitterWhiteIcon from '../../../../../../img/integrations/twitter-white.svg'

import {RootState} from '../../../../../state/types'
import {getCurrentAccountFeatures} from '../../../../../state/currentAccount/selectors'
import {AccountFeature} from '../../../../../state/currentAccount/types'

import IntegrationListLimitAlert from '../IntegrationListLimitAlert'

import TwitterIntegrationListItem from './TwitterIntegrationListItem'

import css from './TwitterIntegrationList.less'

type OwnProps = {
    integrations: List<Map<string, string>>
    loading: Map<string, string>
    redirectUri: string
}

type Props = OwnProps & ConnectedProps<typeof connector>

export function TwitterIntegrationList({
    integrations,
    loading,
    redirectUri,
    maxIntegrations,
}: Props): JSX.Element {
    const twitterIntegrations = integrations.filter(
        (v) => v?.get('type') === IntegrationType.TwitterIntegrationType
    ) as List<Map<any, any>>

    const _maxIntegrations = maxIntegrations || 2
    const isLimitReached = twitterIntegrations.size >= _maxIntegrations

    const longTypeDescription =
        'Create tickets when customers interact with you via replies or mentions on Twitter.'

    const integrationToItemDisplay = (integration: Map<string, string>) => (
        <TwitterIntegrationListItem integration={integration} />
    )

    const alert = (
        <IntegrationListLimitAlert
            totalIntegrations={twitterIntegrations.size}
            maxIntegrations={_maxIntegrations}
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
            createIntegrationButtonHidden={isLimitReached}
            createIntegrationButtonClassName={css.createIntegrationButton}
            integrationToItemDisplay={integrationToItemDisplay}
            loading={loading}
            alert={alert}
        />
    )
}

const mapStateToProps = (state: RootState) => ({
    maxIntegrations: getCurrentAccountFeatures(state).getIn([
        AccountFeature.TwitterIntegration,
        'limit',
    ]),
})

const connector = connect(mapStateToProps)

export default connector(TwitterIntegrationList)
