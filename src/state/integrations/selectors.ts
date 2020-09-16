import {fromJS, List, Map} from 'immutable'
import {createSelector, Selector} from 'reselect'
import _isArray from 'lodash/isArray'

import {IntegrationType} from '../../models/integration/types'
import {compare} from '../../utils.js'
import {RootState, StoreState} from '../types'
import {getCurrentUserState} from '../currentUser/selectors'
import {nestedReplace} from '../ticket/utils.js'

import {EMAIL_INTEGRATION_TYPE} from '../../constants/integration.js'

import {IntegrationsState} from './types'

export const getIntegrationsState = (state: RootState) =>
    state.integrations || fromJS({})

export const getIntegrations = createSelector<
    RootState,
    List<any>,
    IntegrationsState
>(
    getIntegrationsState,
    (state) => state.get('integrations', fromJS([])) as List<any>
)

export const getCurrentIntegration = createSelector<
    RootState,
    Map<any, any>,
    IntegrationsState
>(
    getIntegrationsState,
    (state) => (state.get('integration') || fromJS({})) as Map<any, any>
)

export const getActiveIntegrations = createSelector<
    RootState,
    List<any>,
    List<any>
>(
    getIntegrations,
    (state) =>
        state.filter(
            (i: Map<any, any>) => !i.get('deactivated_datetime')
        ) as List<any>
)

export const getIntegrationById = (id: number) =>
    createSelector<RootState, Map<any, any>, List<any>>(
        getIntegrations,
        (integrations: List<any>) => {
            return (
                (integrations.find(
                    (integration: Map<any, any>) =>
                        (integration.get('id', '') as number).toString() ===
                        (id || '').toString()
                ) as Map<any, any>) || fromJS({})
            )
        }
    )

export const makeGetIntegrationById = (state: RootState) => (id: number) =>
    getIntegrationById(id)(state)

export const getIntegrationsByTypes = (
    types: IntegrationType[] | IntegrationType
) =>
    createSelector<RootState, List<any>, List<any>>(
        getIntegrations,
        (integrations) => {
            const formattedTypes = !_isArray(types) ? [types] : types

            return integrations.filter((integration: Map<any, any>) =>
                formattedTypes.includes(
                    integration.get('type') as IntegrationType
                )
            ) as List<any>
        }
    )

export const makeGetIntegrationsByTypes = (state: RootState) => (
    types: IntegrationType[] | IntegrationType
) => getIntegrationsByTypes(types)(state)

export const getEligibleShopifyIntegrationsFor = (state: RootState) => (
    type: IntegrationType
) => {
    const shopifyIntegrations = getIntegrationsByTypes(
        IntegrationType.ShopifyIntegrationType
    )(state)
    const currentIntegrationOfType = getIntegrationsByTypes(type)(state)

    return shopifyIntegrations.filter(
        (integration: Map<any, any>) =>
            !currentIntegrationOfType.find(
                (currentIntegration: Map<any, any>) =>
                    currentIntegration.get('name') === integration.get('name')
            )
    ) as List<any>
}

export const getFacebookIntegrations = createSelector<
    RootState,
    List<any>,
    List<any>
>(
    getIntegrations,
    (state) =>
        state
            .filter(
                (integration: Map<any, any>) =>
                    integration.get('type') === 'facebook'
            )
            .sort((a: Map<any, any>, b: Map<any, any>) =>
                compare(a.getIn(['meta', 'name']), b.getIn(['meta', 'name']))
            ) as List<any>
)

export const getOnboardingIntegrations = (integrationType: IntegrationType) =>
    createSelector<RootState, List<any>, IntegrationsState>(
        getIntegrationsState,
        (state) =>
            (state.getIn([
                'extra',
                integrationType,
                'onboardingIntegrations',
                'data',
            ]) as List<any>) || fromJS([])
    )

export const getOnboardingMeta = (integrationType: IntegrationType) =>
    createSelector<RootState, Map<any, any>, IntegrationsState>(
        getIntegrationsState,
        (state) =>
            (state.getIn([
                'extra',
                integrationType,
                'onboardingIntegrations',
                'meta',
            ]) as Map<any, any>) || fromJS({})
    )

export const getIntegrationTypeExtraState = (
    integrationType: IntegrationType
) =>
    createSelector<RootState, Map<any, any>, IntegrationsState>(
        getIntegrationsState,
        (state) =>
            (state.getIn(['extra', integrationType]) as Map<any, any>) ||
            fromJS({})
    )

export const getFacebookMaxAccountAds = createSelector<
    RootState,
    number,
    IntegrationsState
>(
    getIntegrationsState,
    (state) =>
        (state.getIn([
            'extra',
            IntegrationType.FacebookIntegrationType,
            'max_account_ads',
        ]) as number) || 0
)

export const getEmailIntegrations = createSelector<
    RootState,
    List<any>,
    List<any>
>(
    getIntegrations,
    (state) =>
        state.filter((integration: Map<any, any>) =>
            [
                IntegrationType.EmailIntegrationType,
                IntegrationType.GmailIntegrationType,
                IntegrationType.OutlookIntegrationType,
            ].includes(integration.get('type'))
        ) as List<any>
)

export const getBaseEmailIntegration = createSelector<
    RootState,
    Map<any, any>,
    List<any>
>(
    getEmailIntegrations,
    (state) =>
        (state.find((integration: Map<any, any>) =>
            (integration.getIn(['meta', 'address'], '') as string).endsWith(
                window.EMAIL_FORWARDING_DOMAIN
            )
        ) as Map<any, any>) || fromJS({})
)

// return email and gmail integrations formatted as channel
export const getChannels = createSelector<
    RootState,
    List<any>,
    Map<any, any>,
    Map<any, any>,
    List<any>
>(
    (state: RootState) => state.ticket || fromJS({}),
    getCurrentUserState,
    getEmailIntegrations,
    (currentTicket, currentUser, integrations) => {
        return integrations.map((integration: Map<any, any>) => {
            let type = integration.get('type')

            if (
                [
                    IntegrationType.EmailIntegrationType,
                    IntegrationType.GmailIntegrationType,
                    IntegrationType.OutlookIntegrationType,
                ].includes(integration.get('type'))
            ) {
                type = IntegrationType.EmailIntegrationType
            }

            return fromJS({
                id: integration.get('id'),
                type,
                name: integration.get('name'),
                address: integration.getIn(['meta', 'address']),
                preferred: integration.getIn(['meta', 'preferred']),
                signature: nestedReplace(
                    integration.getIn(['meta', 'signature']),
                    currentTicket,
                    currentUser
                ),
                verified:
                    integration.get('type') !==
                        IntegrationType.EmailIntegrationType ||
                    integration.getIn(['meta', 'verified'], false),
            }) as Map<any, any>
        }) as List<any>
    }
)

export const getChannelsByType = (type: string) =>
    createSelector<RootState, List<any>, List<any>>(
        getChannels,
        (state) =>
            state.filter(
                (integration: Map<any, any>) => integration.get('type') === type
            ) as List<any>
    )

export const getChannelByTypeAndAddress = (
    type: IntegrationType,
    address: string
) =>
    createSelector<RootState, Map<any, any>, List<any>>(
        getChannels,
        (channels) =>
            (channels
                .filter(
                    (channel: Map<any, any>) =>
                        channel.get('type') === type &&
                        channel.get('address') === address
                )
                .first() as Map<any, any>) || fromJS({})
    )

export const getChannelSignature = (type: IntegrationType, address: string) =>
    createSelector<RootState, Map<any, any>, Map<any, any>>(
        getChannelByTypeAndAddress(type, address),
        (channel) => (channel.get('signature') as Map<any, any>) || fromJS({})
    )

export const getAuthData = (type: IntegrationType) =>
    createSelector<RootState, Map<any, any>, IntegrationsState>(
        getIntegrationsState,
        (state) =>
            state.getIn(['authentication', type], fromJS({})) as Map<any, any>
    )

export const getRedirectUri = (type: IntegrationType) =>
    createSelector<RootState, string, Map<any, any>>(
        getAuthData(type),
        (state) => state.get('redirect_uri', '') as string
    )

export const getForwardingEmailAddress = createSelector<
    RootState,
    string,
    Map<any, any>
>(
    getAuthData(IntegrationType.EmailIntegrationType),
    (state) => state.get('forwarding_email_address', '') as string
)

export const getFacebookRedirectUri = (reconnect = false) =>
    createSelector<RootState, string, Map<any, any>>(
        getAuthData(IntegrationType.FacebookIntegrationType),
        (state) =>
            state.get(
                reconnect ? 'redirect_uri_reconnect' : 'redirect_uri',
                ''
            ) as string
    )

export const makeGetRedirectUri = (state: RootState) => (
    type: IntegrationType
) => getRedirectUri(type)(state)

// return the list of integration used to send messages from the helpdesk
export const getMessagingIntegrations = createSelector<
    RootState,
    List<any>,
    List<any>
>(
    getIntegrationsByTypes([
        IntegrationType.EmailIntegrationType,
        IntegrationType.OutlookIntegrationType,
        IntegrationType.GmailIntegrationType,
        IntegrationType.AircallIntegrationType,
        IntegrationType.SmoochInsideIntegrationType,
        IntegrationType.SmoochIntegrationType,
        IntegrationType.FacebookIntegrationType,
    ]),
    (integrations) => {
        return integrations.map((inte: Map<any, any>) => {
            if (inte.get('type') === IntegrationType.FacebookIntegrationType) {
                return inte.set('name', inte.getIn(['meta', 'name']))
            }
            return inte
        }) as List<any>
    }
)

export const hasIntegrationOfTypes = (
    types: IntegrationType[] | IntegrationType
) =>
    createSelector<RootState, boolean, List<any>>(
        getIntegrationsByTypes(types),
        (integrations) => !integrations.isEmpty()
    )

export const makeHasIntegrationOfTypes = (state: RootState) => (
    types: IntegrationType[] | IntegrationType
) => hasIntegrationOfTypes(types)(state)

export const getShopifyIntegrationsWithoutChat = (state: RootState) => {
    const shopifyIntegrations = getIntegrationsByTypes(
        IntegrationType.ShopifyIntegrationType
    )(state)
    const chatIntegrations = getIntegrationsByTypes(
        IntegrationType.SmoochInsideIntegrationType
    )(state)

    return shopifyIntegrations.filter((shopifyIntegration: Map<any, any>) => {
        const shopifyId = shopifyIntegration.get('id') as number

        return !chatIntegrations.some((chatIntegration: Map<any, any>) => {
            return (chatIntegration.getIn(
                ['meta', 'shopify_integration_ids'],
                fromJS([])
            ) as List<any>).contains(shopifyId)
        })
    }) as List<any>
}

export const getShopifyIntegrationsWithoutFacebook = (state: RootState) => {
    const shopifyIntegrations = getIntegrationsByTypes(
        IntegrationType.ShopifyIntegrationType
    )(state)
    const facebookIntegrations = getIntegrationsByTypes(
        IntegrationType.FacebookIntegrationType
    )(state)

    return shopifyIntegrations.filter((shopifyIntegration: Map<any, any>) => {
        const shopifyId = shopifyIntegration.get('id') as number

        return !facebookIntegrations.some(
            (facebookIntegration: Map<any, any>) => {
                return (facebookIntegration.getIn(
                    ['meta', 'shopify_integration_ids'],
                    fromJS([])
                ) as List<any>).contains(shopifyId)
            }
        )
    }) as List<any>
}

export const getShopifyIntegrationByShopName = (shopName: string) =>
    createSelector<RootState, Map<any, any>, List<any>>(
        getIntegrationsByTypes([IntegrationType.ShopifyIntegrationType]),
        (state) =>
            (state.find(
                (integration: Map<any, any>) =>
                    integration.getIn(['meta', 'shop_name']) === shopName
            ) as Map<any, any>) || fromJS({})
    )

export const makeGetShopifyIntegrationByShopName = (state: RootState) => (
    shopName: string
) => getShopifyIntegrationByShopName(shopName)(state)

export const getMagento2IntegrationByStoreUrl = (storeUrl: string) =>
    createSelector<RootState, Map<any, any>, List<any>>(
        getIntegrationsByTypes([IntegrationType.Magento2IntegrationType]),
        (state) =>
            (state.find(
                (integration: Map<any, any>) =>
                    integration.getIn(['meta', 'store_url']) === storeUrl
            ) as Map<any, any>) || fromJS({})
    )

export const makeGetMagento2IntegrationByStoreUrl = (state: RootState) => (
    storeUrl: string
) => getMagento2IntegrationByStoreUrl(storeUrl)(state)

export const getChatIntegrationCampaigns = (id: number) =>
    createSelector<RootState, List<any>, Map<any, any>>(
        getIntegrationById(id),
        (integration) =>
            (integration.getIn(['meta', 'campaigns']) as List<any>) ||
            fromJS([])
    )

export const getChatIntegrationCampaignById = (
    id: number,
    campaignId: number
) =>
    createSelector<RootState, Map<any, any>, List<any>>(
        getChatIntegrationCampaigns(id),
        (campaigns) =>
            (campaigns.find(
                (campaign: Map<any, any>) => campaign.get('id') === campaignId
            ) || fromJS({})) as Map<any, any>
    )

export const isImportAllowed = (state: RootState) =>
    getEmailIntegrations(state).filter((integration: Map<any, any>) => {
        const isBaseIntegration = (integration.getIn(
            ['meta', 'address'],
            ''
        ) as string).includes(window.EMAIL_FORWARDING_DOMAIN)
        const isDeactivated = !!integration.get('deactivated_datetime')
        const isNotVerified =
            integration.get('type') === EMAIL_INTEGRATION_TYPE &&
            !integration.getIn(['meta', 'verified'])

        return !isBaseIntegration && !isDeactivated && !isNotVerified
    }).size > 0
