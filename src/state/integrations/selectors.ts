import {fromJS, List, Map} from 'immutable'
import {createSelector} from 'reselect'
import _isArray from 'lodash/isArray'

import {INTEGRATION_TYPE_CONFIG} from 'config'
import {
    Integration,
    IntegrationType,
    isPhoneIntegration,
    isSmsIntegration,
} from 'models/integration/types'
import {MESSAGING_INTEGRATION_TYPES} from 'models/integration/constants'
import {PhoneNumber} from 'models/phoneNumber/types'
import {compare} from 'utils'
import {RootState} from 'state/types'
import {getCurrentUserState} from 'state/currentUser/selectors'
import {getPhoneNumbers as getPhoneNumbersState} from 'state/entities/phoneNumbers/selectors'
import {nestedReplace} from 'state/ticket/utils'

import {
    IntegrationsState,
    IntegrationsImmutableState,
    IntegrationListItem,
} from './types'

type IntegrationsCountMap = {
    [key in IntegrationType]?: number
}

export const DEPRECATED_getIntegrationsState = (state: RootState) =>
    state.integrations || fromJS({})

export const getIntegrationsState = (state: RootState): IntegrationsState =>
    state.integrations.toJS() as IntegrationsState

export const DEPRECATED_getIntegrations = createSelector<
    RootState,
    List<any>,
    IntegrationsImmutableState
>(
    DEPRECATED_getIntegrationsState,
    (state) => state.get('integrations', fromJS([])) as List<any>
)

export const getIntegrations = createSelector<
    RootState,
    Integration[],
    IntegrationsState
>(getIntegrationsState, (state) => state.integrations)

export const getIntegrationsCountPerType = createSelector<
    RootState,
    IntegrationsCountMap,
    Integration[]
>(getIntegrations, (integrations) => {
    return integrations.reduce(
        (accumulator: IntegrationsCountMap = {}, item: Integration) => {
            if (!item.deactivated_datetime) {
                accumulator[item.type] = (accumulator[item.type] || 0) + 1
            }
            return accumulator
        },
        {}
    )
})

export const getIntegrationsList = createSelector<
    RootState,
    IntegrationListItem[],
    IntegrationsCountMap
>(getIntegrationsCountPerType, (counts) => {
    return INTEGRATION_TYPE_CONFIG.reduce(
        (accumulator: IntegrationListItem[], description) => {
            let count = 0

            if (description.subTypes) {
                description.subTypes.forEach((type) => {
                    count += counts[type] || 0
                })
            } else {
                count += counts[description.type] || 0
            }

            return [
                ...accumulator,
                {
                    ...description,
                    count,
                },
            ]
        },
        []
    )
})

export const getCurrentIntegration = createSelector<
    RootState,
    Map<any, any>,
    IntegrationsImmutableState
>(
    DEPRECATED_getIntegrationsState,
    (state) => (state.get('integration') || fromJS({})) as Map<any, any>
)

export const getActiveIntegrations = createSelector<
    RootState,
    List<any>,
    List<any>
>(
    DEPRECATED_getIntegrations,
    (state) =>
        state.filter(
            (i: Map<any, any>) =>
                !i.get('deactivated_datetime') &&
                i.get('type') !== IntegrationType.SelfService
        ) as List<any>
)

export const getIntegrationById = (id: number) =>
    createSelector<RootState, Map<any, any>, List<any>>(
        DEPRECATED_getIntegrations,
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

export const getIntegrationsByType = <T extends Integration>(type: T['type']) =>
    createSelector<RootState, T[], IntegrationsState>(
        getIntegrationsState,
        (state) => {
            return state.integrations.filter(
                (integration): integration is T => integration.type === type
            )
        }
    )

export const getIntegrationsByTypes = (
    types: readonly IntegrationType[] | IntegrationType[]
) =>
    createSelector<RootState, Integration[], IntegrationsState>(
        getIntegrationsState,
        (state) => {
            return state.integrations.filter((integration) =>
                types.includes(integration.type)
            )
        }
    )

export const DEPRECATED_getIntegrationsByTypes = (
    types: readonly IntegrationType[] | IntegrationType[] | IntegrationType
) =>
    createSelector<RootState, List<any>, List<any>>(
        DEPRECATED_getIntegrations,
        (integrations) => {
            const formattedTypes = !_isArray(types) ? [types] : types

            return integrations.filter((integration: Map<any, any>) =>
                formattedTypes.includes(
                    integration.get('type') as IntegrationType
                )
            ) as List<any>
        }
    )

export const makeGetIntegrationsByTypes =
    (state: RootState) => (types: IntegrationType[] | IntegrationType) =>
        DEPRECATED_getIntegrationsByTypes(types)(state)

export const getEligibleShopifyIntegrationsFor =
    (state: RootState) => (type: IntegrationType) => {
        const shopifyIntegrations = DEPRECATED_getIntegrationsByTypes(
            IntegrationType.Shopify
        )(state)
        const currentIntegrationOfType =
            DEPRECATED_getIntegrationsByTypes(type)(state)

        return shopifyIntegrations.filter(
            (integration: Map<any, any>) =>
                !currentIntegrationOfType.find(
                    (currentIntegration: Map<any, any>) =>
                        currentIntegration.get('name') ===
                        integration.get('name')
                )
        ) as List<any>
    }

export const getFacebookIntegrations = createSelector<
    RootState,
    List<any>,
    List<any>
>(
    DEPRECATED_getIntegrations,
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
    createSelector<RootState, List<any>, IntegrationsImmutableState>(
        DEPRECATED_getIntegrationsState,
        (state) =>
            (state.getIn([
                'extra',
                integrationType,
                'onboardingIntegrations',
                'data',
            ]) as List<any>) || fromJS([])
    )

export const getOnboardingMeta = (integrationType: IntegrationType) =>
    createSelector<RootState, Map<any, any>, IntegrationsImmutableState>(
        DEPRECATED_getIntegrationsState,
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
    createSelector<RootState, Map<any, any>, IntegrationsImmutableState>(
        DEPRECATED_getIntegrationsState,
        (state) =>
            (state.getIn(['extra', integrationType]) as Map<any, any>) ||
            fromJS({})
    )

export const getFacebookMaxAccountAds = createSelector<
    RootState,
    number,
    IntegrationsImmutableState
>(
    DEPRECATED_getIntegrationsState,
    (state) =>
        (state.getIn([
            'extra',
            IntegrationType.Facebook,
            'max_account_ads',
        ]) as number) || 0
)

export const getEmailIntegrations = createSelector<
    RootState,
    List<any>,
    List<any>
>(
    DEPRECATED_getIntegrations,
    (state) =>
        state.filter((integration: Map<any, any>) =>
            [
                IntegrationType.Email,
                IntegrationType.Gmail,
                IntegrationType.Outlook,
            ].includes(integration.get('type'))
        ) as List<any>
)

export const DEPRECATED_getPhoneIntegrations = createSelector<
    RootState,
    List<any>,
    List<any>
>(
    DEPRECATED_getIntegrations,
    (state) =>
        state.filter(
            (integration: Map<any, any>) =>
                integration.get('type') === IntegrationType.Phone
        ) as List<any>
)

export const getPhoneIntegrations = createSelector(
    getIntegrations,
    (integrations) => integrations.filter(isPhoneIntegration)
)

export const getSmsIntegrations = createSelector(
    getIntegrations,
    (integrations) => integrations.filter(isSmsIntegration)
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
export const getEmailChannels = createSelector<
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
                    IntegrationType.Email,
                    IntegrationType.Gmail,
                    IntegrationType.Outlook,
                ].includes(integration.get('type'))
            ) {
                type = IntegrationType.Email
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
                    integration.get('type') !== IntegrationType.Email ||
                    integration.getIn(['meta', 'verified'], false),
            }) as Map<any, any>
        }) as List<any>
    }
)

// return phone integrations formatted as channel
export const makeGetPhoneChannels = (
    type: IntegrationType.Phone | IntegrationType.Sms
) =>
    createSelector<
        RootState,
        List<any>,
        Map<any, any>,
        List<any>,
        Record<number, PhoneNumber>
    >(
        (state: RootState) => state.ticket || fromJS({}),
        DEPRECATED_getIntegrationsByTypes([type]),
        getPhoneNumbersState,
        (currentTicket, integrations, phoneNumbers) => {
            return integrations.map((integration: Map<any, any>) => {
                const phoneNumber =
                    phoneNumbers[
                        integration.getIn([
                            'meta',
                            'twilio_phone_number_id',
                        ]) as number
                    ]

                return fromJS({
                    id: integration.get('id'),
                    type: integration.get('type'),
                    name: integration.get('name'),
                    address: phoneNumber?.phone_number,
                }) as Map<any, any>
            }) as List<any>
        }
    )

export const getPhoneChannelsForPhoneSource = makeGetPhoneChannels(
    IntegrationType.Phone
)
export const getPhoneChannelsForSmsSource = makeGetPhoneChannels(
    IntegrationType.Sms
)

export const getChannelsByType = (type: string) =>
    createSelector<RootState, List<any>, List<any>, List<any>, List<any>>(
        getEmailChannels,
        getPhoneChannelsForSmsSource,
        getPhoneChannelsForPhoneSource,
        (emailChannels, smsChannels, phoneChannels) =>
            emailChannels
                .concat(smsChannels)
                .concat(phoneChannels)
                .filter(
                    (integration: Map<any, any>) =>
                        integration.get('type') === type
                ) as List<any>
    )

export const getChannelByTypeAndAddress = (
    type: IntegrationType,
    address: string
) =>
    createSelector<RootState, Map<any, any>, List<any>>(
        getEmailChannels,
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
    createSelector<RootState, Map<any, any>, IntegrationsImmutableState>(
        DEPRECATED_getIntegrationsState,
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
    getAuthData(IntegrationType.Email),
    (state) => state.get('forwarding_email_address', '') as string
)

export const getFacebookRedirectUri = (reconnect = false) =>
    createSelector<RootState, string, Map<any, any>>(
        getAuthData(IntegrationType.Facebook),
        (state) =>
            state.get(
                reconnect ? 'redirect_uri_reconnect' : 'redirect_uri',
                ''
            ) as string
    )

export const makeGetRedirectUri =
    (state: RootState) => (type: IntegrationType) =>
        getRedirectUri(type)(state)

// return the list of integration used to send messages from the helpdesk
export const getMessagingIntegrations = createSelector<
    RootState,
    List<Map<any, any>>,
    List<Map<any, any>>
>(
    DEPRECATED_getIntegrationsByTypes(MESSAGING_INTEGRATION_TYPES),
    (integrations) => {
        return integrations.map((integration) => {
            if (integration!.get('type') === IntegrationType.Facebook) {
                return integration!.set(
                    'name',
                    integration!.getIn(['meta', 'name'])
                )
            }
            return integration
        }) as List<Map<any, any>>
    }
)

export const hasIntegrationOfTypes = (
    types: IntegrationType[] | IntegrationType
) =>
    createSelector<RootState, boolean, List<any>>(
        DEPRECATED_getIntegrationsByTypes(types),
        (integrations) => !integrations.isEmpty()
    )

export const makeHasIntegrationOfTypes =
    (state: RootState) => (types: IntegrationType[] | IntegrationType) =>
        hasIntegrationOfTypes(types)(state)

export const getShopifyIntegrationsWithoutChat = (state: RootState) => {
    const shopifyIntegrations = DEPRECATED_getIntegrationsByTypes(
        IntegrationType.Shopify
    )(state)
    const chatIntegrations = DEPRECATED_getIntegrationsByTypes(
        IntegrationType.SmoochInside
    )(state)

    return shopifyIntegrations.filter((shopifyIntegration: Map<any, any>) => {
        const shopifyId = shopifyIntegration.get('id') as number

        return !chatIntegrations.some((chatIntegration: Map<any, any>) => {
            return (
                chatIntegration.getIn(
                    ['meta', 'shopify_integration_ids'],
                    fromJS([])
                ) as List<any>
            ).contains(shopifyId)
        })
    }) as List<any>
}

export const getShopifyIntegrationsWithoutFacebook = (state: RootState) => {
    const shopifyIntegrations = DEPRECATED_getIntegrationsByTypes(
        IntegrationType.Shopify
    )(state)
    const facebookIntegrations = DEPRECATED_getIntegrationsByTypes(
        IntegrationType.Facebook
    )(state)

    return shopifyIntegrations.filter((shopifyIntegration: Map<any, any>) => {
        const shopifyId = shopifyIntegration.get('id') as number

        return !facebookIntegrations.some(
            (facebookIntegration: Map<any, any>) => {
                return (
                    facebookIntegration.getIn(
                        ['meta', 'shopify_integration_ids'],
                        fromJS([])
                    ) as List<any>
                ).contains(shopifyId)
            }
        )
    }) as List<any>
}

export const getShopifyIntegrationByShopName = (shopName: string) =>
    createSelector<RootState, Map<any, any>, List<any>>(
        DEPRECATED_getIntegrationsByTypes([IntegrationType.Shopify]),
        (state) =>
            (state.find(
                (integration: Map<any, any>) =>
                    integration.getIn(['meta', 'shop_name']) === shopName
            ) as Map<any, any>) || fromJS({})
    )

export const getMagento2IntegrationByStoreUrl = (storeUrl: string) =>
    createSelector<RootState, Map<any, any>, List<any>>(
        DEPRECATED_getIntegrationsByTypes([IntegrationType.Magento2]),
        (state) =>
            (state.find(
                (integration: Map<any, any>) =>
                    integration.getIn(['meta', 'store_url']) === storeUrl
            ) as Map<any, any>) || fromJS({})
    )

export const getChatIntegrationCampaigns = (id: number) =>
    createSelector<RootState, List<any>, Map<any, any>>(
        getIntegrationById(id),
        (integration) =>
            (integration.getIn(['meta', 'campaigns']) as List<any>) ||
            fromJS([])
    )

export const getChatIntegrationCampaignById = (
    id: number,
    campaignId: number | string
) =>
    createSelector<RootState, Map<any, any>, List<any>>(
        getChatIntegrationCampaigns(id),
        (campaigns) =>
            (campaigns.find(
                (campaign: Map<any, any>) => campaign.get('id') === campaignId
            ) || fromJS({})) as Map<any, any>
    )

export const hasAtLeastOneEmailIntegration = (state: RootState) =>
    getEmailIntegrations(state).filter((integration: Map<any, any>) => {
        const isBaseIntegration = (
            integration.getIn(['meta', 'address'], '') as string
        ).includes(window.EMAIL_FORWARDING_DOMAIN)
        const isDeactivated = !!integration.get('deactivated_datetime')
        const isNotVerified =
            integration.get('type') === IntegrationType.Email &&
            !integration.getIn(['meta', 'verified'])

        return !isBaseIntegration && !isDeactivated && !isNotVerified
    }).size > 0

export const getEmailForwardingActivated = (id: number) =>
    createSelector<RootState, boolean, Map<any, any>>(
        getIntegrationById(id),
        (integration) =>
            integration.getIn(
                ['meta', 'email_forwarding_activated'],
                false
            ) as boolean
    )

export const getAreIntegrationsLoading = createSelector(
    getIntegrationsState,
    (state) => state?.state?.loading?.integrations === true
)
