// @flow
import {fromJS} from 'immutable'
import {createSelector} from 'reselect'
import _isArray from 'lodash/isArray'

import {compare} from '../../utils'

import type {stateType} from '../types'
type typesType = Array<string> | string

export const getIntegrationsState = (state: stateType) => state.integrations || fromJS({})

export const getIntegrations = createSelector(
    [getIntegrationsState],
    state => state.get('integrations', fromJS([]))
)

export const getActiveIntegrations = createSelector(
    [getIntegrations],
    state => state.filter(i => !i.get('deactivated_datetime'))
)

export const getIntegrationById = (id: number) => createSelector(
    [getIntegrations],
    (integrations) => {
        return integrations.find(integration => integration.get('id', '').toString() === (id || '').toString())
            || fromJS({})
    }
)

export const makeGetIntegrationById = (state: stateType) => (id: number) => getIntegrationById(id)(state)

export const getIntegrationsByTypes = (types: typesType) => createSelector(
    [getIntegrations],
    (integrations) => {
        if (!_isArray(types)) {
            // $FlowFixMe
            types = [types]
        }

        return integrations.filter(integration => types.includes(integration.get('type')))
    }
)

export const getFacebookIntegrations = createSelector(
    [getIntegrations],
    state => state
        .filter(integration => integration.get('type') === 'facebook')
        .sort((a, b) => compare(a.getIn(['facebook', 'name']), b.getIn(['facebook', 'name'])))
)

export const getFacebookOnboardingPages = createSelector(
    [getIntegrationsState],
    state => state.getIn(['extra', 'facebook', 'onboardingPages']) || fromJS([])
)

export const getEmailIntegrations = createSelector(
    [getIntegrations],
    state => state.filter(integration => ['email', 'gmail'].includes(integration.get('type')))
)

// return email and gmail integrations formatted as channel
export const getChannels = createSelector(
    [getEmailIntegrations],
    state => state.map(integration => {
        let type = integration.get('type')

        if (integration.get('type') === 'gmail') {
            type = 'email'
        }

        return fromJS({
            id: integration.get('id'),
            type,
            name: integration.get('name'),
            address: integration.getIn(['meta', 'address']),
            preferred: integration.getIn(['meta', 'preferred']),
        })
    })
)

export const getChannelsByType = (type: string) => createSelector(
    [getChannels],
    state => state.filter(integration => integration.get('type') === type)
)

export const getAuthData = (type: string) => createSelector(
    [getIntegrationsState],
    state => state.getIn(['authentication', type], fromJS({}))
)

export const getRedirectUri = (type: string) => createSelector(
    [getAuthData(type)],
    state => state.get('redirect_uri', '')
)

export const makeGetRedirectUri = (state: stateType) => (type: string) => getRedirectUri(type)(state)

// return the list of integration used to send messages from the helpdesk
export const getMessagingIntegrations = createSelector(
    [getIntegrationsByTypes(['aircall', 'email', 'gmail', 'smooch', 'smooch_inside', 'facebook'])],
    (integrations) => {
        return integrations.map((inte) => {
            if (inte.get('type') === 'facebook') {
                return inte.set('name', inte.getIn(['facebook', 'name']))
            }
            return inte
        })
    }
)

export const hasIntegrationOfTypes = (types: typesType) => createSelector(
    [getIntegrationsByTypes(types)],
    integrations => !integrations.isEmpty()
)

export const makeHasIntegrationOfTypes = (state: stateType) => (types: typesType) => hasIntegrationOfTypes(types)(state)

export const getIntegrationExtra = (type: string) => createSelector(
    [getIntegrationsState],
    state => state.getIn(['extra', type]) || fromJS({})
)

export const getShopifyIntegrationsWithoutChat = (state: stateType) => {
    const shopifyIntegrations = getIntegrationsByTypes('shopify')(state)
    const chatIntegrations = getIntegrationsByTypes('smooch_inside')(state)

    return shopifyIntegrations.filter((shopifyIntegration) => {
        const shopifyId = shopifyIntegration.get('id')

        return !chatIntegrations.some((chatIntegration) => {
            return chatIntegration.getIn(['meta', 'shopify_integration_ids'], fromJS([])).contains(shopifyId)
        })
    })
}

export const getChatIntegrationCampaigns = (id) => createSelector(
    [getIntegrationById(id)],
    (integration) => integration.getIn(['meta', 'campaigns']) || fromJS([])
)

export const getChatIntegrationCampaignById = (id, campaignId) => createSelector(
    [getChatIntegrationCampaigns(id)],
    (campaigns) => campaigns.find((campaign) => campaign.get('id') === campaignId) || fromJS({})
)
