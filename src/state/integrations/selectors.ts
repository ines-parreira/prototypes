import {fromJS, List, Map} from 'immutable'
import {createSelector} from 'reselect'
import _isArray from 'lodash/isArray'

import {INTEGRATION_TYPE_CONFIG, isChannel} from 'config'
import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'
import {
    AppIntegration,
    Integration,
    IntegrationFromType,
    IntegrationType,
    isAppIntegration,
    isPhoneIntegration,
    isSmsIntegration,
    isStandardPhoneIntegration,
    isWhatsAppIntegration,
    WhatsAppIntegration,
} from 'models/integration/types'
import {MESSAGING_INTEGRATION_TYPES} from 'models/integration/constants'
import {compare} from 'utils'
import {RootState} from 'state/types'
import {getCurrentUserState} from 'state/currentUser/selectors'
import {getNewPhoneNumbers as getNewPhoneNumbersState} from 'state/entities/phoneNumbers/selectors'
import {isBaseEmailIntegration} from 'pages/integrations/integration/components/email/helpers'
import {
    Channel,
    ChannelLike,
    getChannelById,
    getChannelBySlug,
} from 'services/channels'
import {SourceAddress} from 'models/ticket/types'
import {
    getApplicationById,
    getApplicationsByChannel,
} from 'services/applications'
import {
    isSourceAddress,
    isTicketChannel,
    isTicketMessageSourceType,
} from 'models/ticket/predicates'
import {nestedReplace} from 'tickets/common/utils'

import {IntegrationListItem, IntegrationsState} from './types'

type IntegrationsCountMap = {
    [key in IntegrationType]?: number
}

export const DEPRECATED_getIntegrationsState = (state: RootState) =>
    state.integrations || fromJS({})

export const getIntegrationsState = createSelector(
    DEPRECATED_getIntegrationsState,
    (state) => {
        return state.toJS() as IntegrationsState
    }
)

export const DEPRECATED_getIntegrations = createSelector(
    DEPRECATED_getIntegrationsState,
    (state) => state.get('integrations', fromJS([])) as List<any>
)

export const getIntegrations = createSelector(
    getIntegrationsState,
    (state) => state.integrations
)

export const getIntegrationsCountPerType = createSelector(
    getIntegrations,
    (integrations) => {
        return integrations.reduce(
            (accumulator: IntegrationsCountMap = {}, item: Integration) => {
                if (!item.deactivated_datetime) {
                    accumulator[item.type] = (accumulator[item.type] || 0) + 1
                }
                return accumulator
            },
            {}
        )
    }
)

export const getIntegrationsList = createSelector(
    getIntegrationsCountPerType,
    (counts) => {
        return INTEGRATION_TYPE_CONFIG.reduce(
            (accumulator: IntegrationListItem[], description) => {
                if (
                    isChannel(description.type) ||
                    description.type === IntegrationType.Http
                )
                    return accumulator
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
    }
)

export const getCurrentIntegration = createSelector(
    DEPRECATED_getIntegrationsState,
    (state) => (state.get('integration') || fromJS({})) as Map<any, any>
)

export const getActiveIntegrations = createSelector(
    DEPRECATED_getIntegrations,
    (state) =>
        state.filter(
            (i: Map<any, any>) => !i.get('deactivated_datetime')
        ) as List<any>
)

export const getIntegrationById = (id: number) =>
    createSelector(DEPRECATED_getIntegrations, (integrations: List<any>) => {
        return (
            (integrations.find(
                (integration: Map<any, any>) =>
                    (integration.get('id', '') as number).toString() ===
                    (id || '').toString()
            ) as Map<any, any>) || fromJS({})
        )
    })

export const getIntegrationByIdAndType = <T extends Integration>(
    id: number,
    type: IntegrationType
) =>
    createSelector(getIntegrations, (integrations) => {
        return integrations.find(
            (integration): integration is T =>
                integration.id.toString() === (id || '').toString() &&
                integration.type === type
        )
    })

export const getIntegrationsByType = <T extends Integration>(
    type: IntegrationType | string
) =>
    createSelector(getIntegrationsState, (state) => {
        return state.integrations.filter(
            (integration): integration is T => integration.type === type
        )
    })

export const getIntegrationsByAppId = (appId: string) =>
    createSelector(
        getIntegrationsByTypes([
            IntegrationType.App,
            IntegrationType.Ecommerce,
        ]),
        (integrations) => {
            return integrations.filter(
                (integration) => integration.application_id === appId
            )
        }
    )

export const getIntegrationsByTypes = <T extends Integration['type']>(
    types: readonly T[] | T[]
) =>
    createSelector(getIntegrationsState, (state) => {
        return state.integrations.filter(
            (integration): integration is IntegrationFromType<T> =>
                types.includes(integration.type as T)
        )
    })

export const DEPRECATED_getIntegrationsByTypes = (
    types: readonly IntegrationType[] | IntegrationType[] | IntegrationType
) =>
    createSelector(DEPRECATED_getIntegrations, (integrations) => {
        const formattedTypes = !_isArray(types) ? [types] : types

        return integrations.filter((integration: Map<any, any>) =>
            formattedTypes.includes(integration.get('type') as IntegrationType)
        ) as List<any>
    })

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

export const getFacebookIntegrations = createSelector(
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
    createSelector(
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
    createSelector(
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
    createSelector(
        DEPRECATED_getIntegrationsState,
        (state) =>
            (state.getIn(['extra', integrationType]) as Map<any, any>) ||
            fromJS({})
    )

export const getFacebookMaxAccountAds = createSelector(
    DEPRECATED_getIntegrationsState,
    (state) =>
        (state.getIn([
            'extra',
            IntegrationType.Facebook,
            'max_account_ads',
        ]) as number) || 0
)

export const getEmailIntegrations = createSelector(
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

export const DEPRECATED_getPhoneIntegrations = createSelector(
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

export const getStandardPhoneIntegrations = createSelector(
    getIntegrations,
    (integrations) => integrations.filter(isStandardPhoneIntegration)
)

export const getSmsIntegrations = createSelector(
    getIntegrations,
    (integrations) => integrations.filter(isSmsIntegration)
)

export const getWhatsAppIntegrations = createSelector(
    getIntegrations,
    (integrations) => integrations.filter(isWhatsAppIntegration)
)

export const getBaseEmailIntegration = createSelector(
    getEmailIntegrations,
    (state) =>
        (state.find((integration: Map<any, any>) =>
            isBaseEmailIntegration(integration.toJS())
        ) as Map<any, any>) || fromJS({})
)

// return email and gmail integrations formatted as channel
export const getEmailChannels = createSelector(
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
                isDeactivated: !!integration.get('deactivated_datetime'),
            }) as Map<any, any>
        }) as List<any>
    }
)

export const getInactiveEmailChannels = createSelector(
    getEmailChannels,
    (channels) =>
        channels
            .filter((channel: Map<any, any>) => !!channel.get('isDeactivated'))
            .toList()
)

export const getActiveEmailChannels = createSelector(
    getEmailChannels,
    (channels) =>
        channels
            .filter((channel: Map<any, any>) => !channel.get('isDeactivated'))
            .toList()
)

// return phone integrations formatted as channel
export const makeGetPhoneChannels = (
    type: IntegrationType.Phone | IntegrationType.Sms
) =>
    createSelector(
        DEPRECATED_getIntegrationsByTypes([type]),
        getNewPhoneNumbersState,
        (integrations, phoneNumbers) => {
            return integrations.map((integration: Map<any, any>) => {
                const phoneNumber =
                    phoneNumbers[
                        integration.getIn(['meta', 'phone_number_id']) as number
                    ]

                return fromJS({
                    id: integration.get('id'),
                    type: integration.get('type'),
                    name: integration.get('name'),
                    address: phoneNumber?.phone_number,
                    isDeactivated: !!integration.get('deactivated_datetime'),
                    channel: type,
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

// return whatsapp integrations formatted as channel
export const getWhatsAppChannels = createSelector(
    getWhatsAppIntegrations,
    (integrations) => {
        const channels = integrations.map(
            (integration: WhatsAppIntegration) => {
                return {
                    id: integration.id,
                    type: integration.type,
                    name: integration.name,
                    address: integration.meta.routing.phone_number,
                    isDeactivated: !!integration.deactivated_datetime,
                    channel: TicketMessageSourceType.WhatsAppMessage,
                }
            }
        )
        return fromJS(channels) as List<any>
    }
)

export const getChannelsByType = (type: string) =>
    createSelector(
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

export const getChannelsForSourceType =
    (sourceType: TicketMessageSourceType | TicketChannel) =>
    (state: RootState) => {
        switch (sourceType) {
            case TicketMessageSourceType.Phone:
                return getPhoneChannelsForPhoneSource(state)
            case TicketMessageSourceType.Sms:
                return getPhoneChannelsForSmsSource(state)
            case TicketChannel.WhatsApp:
            case TicketMessageSourceType.WhatsAppMessage:
                return getWhatsAppChannels(state)
            default:
                return getEmailChannels(state)
        }
    }

export const getSendersForChannel =
    (channelLike: ChannelLike) =>
    (state: RootState): SourceAddress[] => {
        if (
            isTicketChannel(channelLike) ||
            isTicketMessageSourceType(channelLike)
        ) {
            const sendersForSource =
                getChannelsForSourceType(channelLike)(state).toJS()
            return _isArray(sendersForSource)
                ? sendersForSource.filter(isSourceAddress)
                : []
        }

        const applications = getApplicationsByChannel(channelLike)
        const integrations = getIntegrationsByType<AppIntegration>(
            IntegrationType.App
        )(state)

        return applications
            .map((application) =>
                integrations.find(
                    (integration: AppIntegration) =>
                        integration.application_id === application.id
                )
            )
            .filter(isAppIntegration)
            .map(({name, meta: {address}, deactivated_datetime}) => ({
                address,
                name,
                isDeactivated: !!deactivated_datetime,
            }))
    }

export const getChannelByTypeAndAddress = (
    type: IntegrationType,
    address: string
) =>
    createSelector(
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

export const getIntegrationChannel = (
    id: number
): ((state: RootState) => Channel | undefined) =>
    createSelector(getIntegrationById(id), (integration) => {
        const type = integration.get('type')
        if (type !== IntegrationType.App && isTicketMessageSourceType(type)) {
            return getChannelBySlug(type)
        }

        const id = integration.get('id')
        if (!id) {
            return
        }

        const applicationId = integration.get('application_id')

        if (!applicationId) {
            return
        }

        const application = getApplicationById(applicationId)
        const channelId = application?.channel_id
        if (!channelId) {
            return
        }

        return getChannelById(channelId)
    })

export const getChannelSignature = (type: IntegrationType, address: string) =>
    createSelector(
        getChannelByTypeAndAddress(type, address),
        (channel) => (channel.get('signature') as Map<any, any>) || fromJS({})
    )

export const getAuthData = (type: IntegrationType) =>
    createSelector(
        DEPRECATED_getIntegrationsState,
        (state) =>
            state.getIn(['authentication', type], fromJS({})) as Map<any, any>
    )

export const getRedirectUri = (type: IntegrationType) =>
    createSelector(
        getAuthData(type),
        (state) => state.get('redirect_uri', '') as string
    )

export const getPreRedirectUri = (type: IntegrationType) =>
    createSelector(
        getAuthData(type),
        (state) => state.get('pre_redirect_uri', '') as string
    )

export const getForwardingEmailAddress = createSelector(
    getAuthData(IntegrationType.Email),
    (state) => state.get('forwarding_email_address', '') as string
)

export const getFacebookRedirectUri = (reconnect = false) =>
    createSelector(
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

export const makeGetPreRedirectUri =
    (state: RootState) =>
    (
        type: IntegrationType,
        params: {shop_name: string; install_chat_integration_id: string}
    ) => {
        const preRedirectUri = getPreRedirectUri(type)(state)
        return `${preRedirectUri}?shop_name=${params.shop_name}&install_chat_integration_id=${params.install_chat_integration_id}`
    }

// return the list of integrations:
// - integrations that can send messages from the helpdesk, like Facebook or Email
// - `app` integrations, like Help Center or Contact Form
export const getOperationalIntegrations = createSelector(
    DEPRECATED_getIntegrationsByTypes([
        ...MESSAGING_INTEGRATION_TYPES,
        // Including app integrations, such as `help center` and `contact form`
        IntegrationType.App,
    ]),
    (integrations) => {
        return integrations
            .filter((integration: Map<any, any>) => {
                const type = integration.get('type')
                if (type === IntegrationType.App) {
                    const address: string =
                        integration.getIn(['meta', 'address']) ?? ''

                    return (
                        address.startsWith('help-center') ||
                        address.startsWith('contact-form')
                    )
                }

                return true
            })
            .map((integration: Map<any, any>) => {
                if (integration.get('type') === IntegrationType.Facebook) {
                    return integration.set(
                        'name',
                        integration.getIn(['meta', 'name'])
                    )
                }
                return integration
            })
    }
)

export const hasIntegrationOfTypes = (
    types: IntegrationType[] | IntegrationType
) =>
    createSelector(
        DEPRECATED_getIntegrationsByTypes(types),
        (integrations) => !integrations.isEmpty()
    )

export const makeHasIntegrationOfTypes =
    (state: RootState) => (types: IntegrationType[] | IntegrationType) =>
        hasIntegrationOfTypes(types)(state)

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
    createSelector(
        DEPRECATED_getIntegrationsByTypes([IntegrationType.Shopify]),
        (state) =>
            (state.find(
                (integration: Map<any, any>) =>
                    integration.getIn(['meta', 'shop_name']) === shopName
            ) as Map<any, any>) || fromJS({})
    )

export const getMagento2IntegrationByStoreUrl = (storeUrl: string) =>
    createSelector(
        DEPRECATED_getIntegrationsByTypes([IntegrationType.Magento2]),
        (state) =>
            (state.find(
                (integration: Map<any, any>) =>
                    integration.getIn(['meta', 'store_url']) === storeUrl
            ) as Map<any, any>) || fromJS({})
    )

export const getEmailForwardingActivated = (id: number) =>
    createSelector(
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

export const getIntegrationsLoading = createSelector(
    getIntegrationsState,
    (state) => state?.state?.loading
)

export const getIsChatIntegrationStatusLoading = (id: number) =>
    createSelector(
        getIntegrationsState,
        (state) => !!state.state?.loading?.chatStatus?.[id]
    )

export const getIsChatIntegrationStatusError = (id: number) =>
    createSelector(
        getIntegrationsState,
        (state) => !!state.state?.error?.chatStatus?.[id]
    )

export const getEmailMigrationStatus = createSelector(
    getIntegrationsState,
    (state) => state?.emailMigrationBannerStatus
)

export const getEmailMigrations = createSelector(
    getIntegrationsState,
    (state) => state?.migrations?.email ?? []
)

export const getStoreIntegrations = getIntegrationsByTypes([
    IntegrationType.Shopify,
    IntegrationType.BigCommerce,
    IntegrationType.Magento2,
])

export const getIntegrationByAddress = (address: string) =>
    createSelector(getIntegrations, (integrations) => {
        return integrations.find(
            (integration) =>
                integration?.meta &&
                'address' in integration.meta &&
                integration.meta.address === address
        )
    })
