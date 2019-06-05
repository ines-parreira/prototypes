// @flow
import {fromJS} from 'immutable'
import {createSelector} from 'reselect'
import _isArray from 'lodash/isArray'

import {
    EMAIL_INTEGRATION_TYPE,
    EMAIL_INTEGRATION_TYPES,
    FACEBOOK_INTEGRATION_TYPE,
    MESSAGING_INTEGRATION_TYPES
} from '../../constants/integration'

import {compare} from '../../utils'

import type {stateType} from '../types'

type typesType = Array<string> | string

export const getIntegrationsState = (state: stateType) => state.integrations || fromJS({})

export const getIntegrations = createSelector(
    [getIntegrationsState],
    (state) => state.get('integrations', fromJS([]))
)

export const getCurrentIntegration = createSelector(
    [getIntegrationsState],
    (state) => state.get('integration') || fromJS({})
)

export const getActiveIntegrations = createSelector(
    [getIntegrations],
    (state) => state.filter((i) => !i.get('deactivated_datetime'))
)

export const getIntegrationById = (id: number) => createSelector(
    [getIntegrations],
    (integrations) => {
        return integrations.find((integration) => integration.get('id', '').toString() === (id || '').toString())
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

        return integrations.filter((integration) => types.includes(integration.get('type')))
    }
)

export const makeGetIntegrationsByTypes = (state: stateType) => (types: typesType) =>
    getIntegrationsByTypes(types)(state)

export const getEligibleShopifyIntegrationsFor = (state: stateType) => (type: string) => {
    const shopifyIntegrations = getIntegrationsByTypes('shopify')(state)
    const currentIntegrationOfType = getIntegrationsByTypes(type)(state)

    return shopifyIntegrations.filter((integration) => ! currentIntegrationOfType.find(
        (currentIntegration) => currentIntegration.get('name') === integration.get('name')))
}

export const getFacebookIntegrations = createSelector(
    [getIntegrations],
    (state) => state
        .filter((integration) => integration.get('type') === 'facebook')
        .sort((a, b) => compare(a.getIn(['facebook', 'name']), b.getIn(['facebook', 'name'])))
)

export const getOnboardingIntegrations = (integrationType: string) => createSelector(
    [getIntegrationsState],
    (state) => state.getIn(['extra', integrationType, 'onboardingIntegrations', 'data']) || fromJS([])
)

export const getOnboardingMeta = (integrationType: string) => createSelector(
    [getIntegrationsState],
    (state) => state.getIn(['extra', integrationType, 'onboardingIntegrations', 'meta']) || fromJS({})
)

export const getEmailIntegrations = createSelector(
    [getIntegrations],
    (state) => state.filter((integration) => EMAIL_INTEGRATION_TYPES.includes(integration.get('type')))
)

// return email and gmail integrations formatted as channel
export const getChannels = createSelector(
    [(state) => state, getEmailIntegrations],
    (state, integrations) => {
        const nestedReplace = require('../ticket/utils').nestedReplace

        return integrations.map((integration) => {
            let type = integration.get('type')

            if (EMAIL_INTEGRATION_TYPES.includes(integration.get('type'))) {
                type = EMAIL_INTEGRATION_TYPE
            }

            return fromJS({
                id: integration.get('id'),
                type,
                name: integration.get('name'),
                address: integration.getIn(['meta', 'address']),
                preferred: integration.getIn(['meta', 'preferred']),
                signature: nestedReplace(integration.getIn(['meta', 'signature']), state),
                verified: integration.get('type') !== EMAIL_INTEGRATION_TYPE
                    || integration.getIn(['meta', 'verified'], false)
            })
        })
    }
)

export const getChannelsByType = (type: string) => createSelector(
    [getChannels],
    (state) => state.filter((integration) => integration.get('type') === type)
)

export const getChannelByTypeAndAddress = (type: string, address: string) => createSelector(
    [getChannels],
    (channels) => channels.filter((channel) => channel.get('type') === type && channel.get('address') === address).first() || fromJS({})
)

export const getChannelSignature = (type: string, address: string) => createSelector(
    [getChannelByTypeAndAddress(type, address)],
    (channel) => channel.get('signature') || fromJS({})
)

export const getAuthData = (type: string) => createSelector(
    [getIntegrationsState],
    (state) => state.getIn(['authentication', type], fromJS({}))
)

export const getRedirectUri = (type: string) => createSelector(
    [getAuthData(type)],
    (state) => state.get('redirect_uri', '')
)

export const getFacebookRedirectUri = (reconnect: boolean = false) => createSelector(
    [getAuthData(FACEBOOK_INTEGRATION_TYPE)],
    (state) => state.get(reconnect ? 'redirect_uri_reconnect' : 'redirect_uri', '')
)

export const makeGetRedirectUri = (state: stateType) => (type: string) => getRedirectUri(type)(state)

// return the list of integration used to send messages from the helpdesk
export const getMessagingIntegrations = createSelector(
    [getIntegrationsByTypes(MESSAGING_INTEGRATION_TYPES)],
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
    (integrations) => !integrations.isEmpty()
)

export const makeHasIntegrationOfTypes = (state: stateType) => (types: typesType) => hasIntegrationOfTypes(types)(state)

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

export const getShopifyIntegrationsWithoutFacebook = (state: stateType) => {
    const shopifyIntegrations = getIntegrationsByTypes('shopify')(state)
    const facebookIntegrations = getIntegrationsByTypes('facebook')(state)

    return shopifyIntegrations.filter((shopifyIntegration) => {
        const shopifyId = shopifyIntegration.get('id')

        return !facebookIntegrations.some((facebookIntegration) => {
            return facebookIntegration.getIn(['meta', 'shopify_integration_ids'], fromJS([])).contains(shopifyId)
        })
    })
}

export const getShopifyIntegrationByShopName = (shopName: string) => createSelector(
    [getIntegrationsByTypes(['shopify'])],
    (state) => state.find((integration) => integration.getIn(['meta', 'shop_name']) === shopName) || fromJS({})
)

export const makeGetShopifyIntegrationByShopName = (state: stateType) => (shopName: string) =>
    getShopifyIntegrationByShopName(shopName)(state)

export const getChatIntegrationCampaigns = (id: number) => createSelector(
    [getIntegrationById(id)],
    (integration) => integration.getIn(['meta', 'campaigns']) || fromJS([])
)

export const getChatIntegrationCampaignById = (id: number, campaignId: number) => createSelector(
    [getChatIntegrationCampaigns(id)],
    (campaigns) => campaigns.find((campaign) => campaign.get('id') === campaignId) || fromJS({})
)
