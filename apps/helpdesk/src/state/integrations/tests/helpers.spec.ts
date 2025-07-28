import { fromJS } from 'immutable'
import moment from 'moment-timezone'

import {
    GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
    GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
    GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
} from 'config/integrations/gorgias_chat'
import { account } from 'fixtures/account'
import { IntegrationType } from 'models/integration/constants'
import { GorgiasChatStatusEnum } from 'models/integration/types'
import { InstallationStatus } from 'rest_api/gorgias_chat_protected_api/types'
import {
    AccountSettingBusinessHours,
    AccountSettingType,
} from 'state/currentAccount/types'

import { isWellKnownEcomIntegrationIdMisMatch } from '../helpers'
import * as helpers from '../helpers'

const neutralInstallationStatus: InstallationStatus = {
    applicationId: 1,
    hasBeenRequestedOnce: true,
    installed: true,
    installedOnShopifyCheckout: true,
    minimumSnippetVersion: null,
}

describe('integrations helpers', () => {
    describe('computeChatIntegrationStatus()', () => {
        it('should return `hidden` status when chat is deactivated', () => {
            const integrationState = fromJS({
                created_datetime: '2022-11-21T11:07:43.481450+00:00',
                deactivated_datetime: '2022-11-22T11:07:43.481450+00:00',
                meta: {
                    preferences: {
                        hide_outside_business_hours: false,
                        live_chat_availability:
                            GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
                    },
                },
            })

            expect(
                helpers.computeChatIntegrationStatus(
                    integrationState,
                    true,
                    neutralInstallationStatus,
                ),
            ).toEqual(GorgiasChatStatusEnum.HIDDEN)
        })

        it('should return `hidden-outside-business-hours` status when setting is enabled and is outside business hours', () => {
            const integrationState = fromJS({
                deactivated_datetime: null,
                meta: {
                    preferences: {
                        hide_outside_business_hours: true,
                        live_chat_availability:
                            GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
                    },
                },
            })

            expect(
                helpers.computeChatIntegrationStatus(
                    integrationState,
                    false,
                    neutralInstallationStatus,
                ),
            ).toEqual(GorgiasChatStatusEnum.HIDDEN_OUTSIDE_BUSINESS_HOURS)
        })

        it('should return `offline` status when is outside business hours', () => {
            const integrationState = fromJS({
                deactivated_datetime: null,
                meta: {
                    preferences: {
                        hide_outside_business_hours: false,
                        live_chat_availability:
                            GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
                    },
                },
            })

            expect(
                helpers.computeChatIntegrationStatus(
                    integrationState,
                    false,
                    neutralInstallationStatus,
                ),
            ).toEqual(GorgiasChatStatusEnum.OFFLINE)
        })

        it('should return `offline` status when live chat is offline and is inside business hours', () => {
            const integrationState = fromJS({
                deactivated_datetime: null,
                meta: {
                    preferences: {
                        hide_outside_business_hours: false,
                        live_chat_availability: GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
                    },
                },
            })

            expect(
                helpers.computeChatIntegrationStatus(
                    integrationState,
                    true,
                    neutralInstallationStatus,
                ),
            ).toEqual(GorgiasChatStatusEnum.OFFLINE)
        })

        it('should return `online` status when live chat is always online and is inside business hours', () => {
            const integrationState = fromJS({
                deactivated_datetime: null,
                meta: {
                    preferences: {
                        hide_outside_business_hours: false,
                        live_chat_availability:
                            GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
                    },
                },
            })

            expect(
                helpers.computeChatIntegrationStatus(
                    integrationState,
                    true,
                    neutralInstallationStatus,
                ),
            ).toEqual(GorgiasChatStatusEnum.ONLINE)
        })

        it('should return null when live chat is auto and is inside business hours', () => {
            const integrationState = fromJS({
                deactivated_datetime: null,
                meta: {
                    preferences: {
                        hide_outside_business_hours: false,
                        live_chat_availability:
                            GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
                    },
                },
            })

            expect(
                helpers.computeChatIntegrationStatus(
                    integrationState,
                    true,
                    neutralInstallationStatus,
                ),
            ).toEqual(null)
        })

        it('should return `not-installed` status when installationStatus report uninstalled', () => {
            const integrationState = fromJS({
                deactivated_datetime: null,
                meta: {
                    preferences: {
                        hide_outside_business_hours: false,
                        live_chat_availability:
                            GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
                    },
                },
            })

            expect(
                helpers.computeChatIntegrationStatus(integrationState, true, {
                    ...neutralInstallationStatus,
                    installed: false,
                }),
            ).toEqual(GorgiasChatStatusEnum.NOT_INSTALLED)
        })

        it('should return `not-installed` status when installationStatus report uninstalled (when chat is hidden)', () => {
            const integrationState = fromJS({
                created_datetime: '2022-11-21T11:07:43.481450+00:00',
                deactivated_datetime: '2022-11-22T11:07:43.481450+00:00',
                meta: {
                    preferences: {
                        hide_outside_business_hours: false,
                        live_chat_availability:
                            GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
                    },
                },
            })

            expect(
                helpers.computeChatIntegrationStatus(integrationState, true, {
                    ...neutralInstallationStatus,
                    installed: false,
                }),
            ).toEqual(GorgiasChatStatusEnum.NOT_INSTALLED)
        })

        it('should return `online` status when chat was removed via 1 click long time ago, but it is somehow installed now', () => {
            const integrationState = fromJS({
                deactivated_datetime: null,
                meta: {
                    one_click_uninstallation_datetime: new Date(
                        2020,
                        1,
                        1,
                    ).toISOString(),
                    shopify_integration_ids: [],
                    preferences: {
                        hide_outside_business_hours: false,
                        live_chat_availability:
                            GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
                    },
                },
            })

            expect(
                helpers.computeChatIntegrationStatus(integrationState, true, {
                    ...neutralInstallationStatus,
                    installed: true,
                }),
            ).toEqual(GorgiasChatStatusEnum.ONLINE)
        })

        it('should return `online` status (despite having "installed": false) if chat was installed recently using 1 click installation', () => {
            const integrationState = fromJS({
                deactivated_datetime: null,
                meta: {
                    one_click_installation_datetime: new Date().toISOString(),
                    shopify_integration_ids: [123],
                    preferences: {
                        hide_outside_business_hours: false,
                        live_chat_availability:
                            GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
                    },
                },
            })

            expect(
                helpers.computeChatIntegrationStatus(integrationState, true, {
                    ...neutralInstallationStatus,
                    installed: false,
                }),
            ).toEqual(GorgiasChatStatusEnum.ONLINE)
        })

        it('should return `not-installed` status when chat was removed recently', () => {
            const integrationState = fromJS({
                deactivated_datetime: null,
                meta: {
                    one_click_uninstallation_datetime: new Date().toISOString(),
                    shopify_integration_ids: [],
                    preferences: {
                        hide_outside_business_hours: false,
                        live_chat_availability:
                            GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
                    },
                },
            })

            expect(
                helpers.computeChatIntegrationStatus(integrationState, true, {
                    ...neutralInstallationStatus,
                    installed: true,
                }),
            ).toEqual(GorgiasChatStatusEnum.NOT_INSTALLED)
        })
    })

    describe('isAccountDuringBusinessHours()', () => {
        it('should return false if no valid settings are passed', () => {
            expect(helpers.isAccountDuringBusinessHours()).toEqual(false)
            expect(helpers.isAccountDuringBusinessHours(null)).toEqual(false)
        })

        it('should return false if empty business_hours is passed', () => {
            const businessHoursSettings = {
                id: 2,
                type: AccountSettingType.BusinessHours,
                data: {
                    business_hours: [],
                    timezone: 'US/Pacific',
                },
            } as AccountSettingBusinessHours

            expect(
                helpers.isAccountDuringBusinessHours(businessHoursSettings),
            ).toEqual(false)
        })

        it.each([
            ['2022-11-21T08:00:00-00:00', true], // Monday at 00:00 US/Pacific
            ['2022-11-21T08:30:00-00:00', true], // Monday at 00:30 US/Pacific
            ['2022-11-21T09:00:00-00:00', true], // Monday at 01:00 US/Pacific
            ['2022-11-21T07:59:00-00:00', false], // Sunday at 23:59 US/Pacific
            ['2022-11-21T09:01:00-00:00', false], // Monday at 01:01 US/Pacific
            ['2022-11-20T17:00:00-00:00', true], // Sunday at 09:00 US/Pacific
            ['2022-11-20T14:00:00-00:00', false], // Sunday at 06:00 US/Pacific
            ['2022-11-21T07:00:00-00:00', false], // Sunday at 23:00 US/Pacific
        ])('for value %s should return %s', (dateString, expected) => {
            const fixedUtcDate = moment(dateString)
            jest.spyOn(moment, 'tz').mockImplementation((timezone) =>
                fixedUtcDate.clone().tz(timezone),
            )

            const businessHoursSettings = account
                .settings[0] as AccountSettingBusinessHours
            expect(
                helpers.isAccountDuringBusinessHours(businessHoursSettings),
            ).toEqual(expected)
        })
    })

    describe('isWellKnownEcomIntegrationIdMisMatch', () => {
        it('should return false if responseIntegrationType is empty', () => {
            expect(
                isWellKnownEcomIntegrationIdMisMatch(
                    '',
                    IntegrationType.Shopify,
                ),
            ).toBe(false)
        })

        it('should return false if responseIntegrationType matches clientIntegrationType', () => {
            expect(
                isWellKnownEcomIntegrationIdMisMatch(
                    IntegrationType.Shopify,
                    IntegrationType.Shopify,
                ),
            ).toBe(false)
            expect(
                isWellKnownEcomIntegrationIdMisMatch(
                    IntegrationType.BigCommerce,
                    IntegrationType.BigCommerce,
                ),
            ).toBe(false)
            expect(
                isWellKnownEcomIntegrationIdMisMatch(
                    IntegrationType.Magento2,
                    IntegrationType.Magento2,
                ),
            ).toBe(false)
        })

        it('should return true if responseIntegrationType does not match clientIntegrationType and clientIntegrationType is a well-known ecom type', () => {
            expect(
                isWellKnownEcomIntegrationIdMisMatch(
                    IntegrationType.Email,
                    IntegrationType.BigCommerce,
                ),
            ).toBe(true)
            expect(
                isWellKnownEcomIntegrationIdMisMatch(
                    IntegrationType.Phone,
                    IntegrationType.Magento2,
                ),
            ).toBe(true)
            expect(
                isWellKnownEcomIntegrationIdMisMatch(
                    IntegrationType.Gmail,
                    IntegrationType.Shopify,
                ),
            ).toBe(true)
            expect(
                isWellKnownEcomIntegrationIdMisMatch(
                    IntegrationType.Outlook,
                    IntegrationType.Shopify,
                ),
            ).toBe(true)
        })
    })

    describe('isIntegrationType', () => {
        it('should return true if type is an integration type', () => {
            expect(helpers.isIntegrationType(IntegrationType.Shopify)).toBe(
                true,
            )
        })

        it('should return false if type is not an integration type', () => {
            expect(helpers.isIntegrationType('not-an-integration-type')).toBe(
                false,
            )
        })
    })

    describe('getIntegrationDisplayName', () => {
        it('should return the title from config', () => {
            expect(
                helpers.getIntegrationDisplayName(IntegrationType.Email),
            ).toBe('Email')
            expect(
                helpers.getIntegrationDisplayName(IntegrationType.Facebook),
            ).toBe('Facebook, Messenger & Instagram')
        })

        it('should return the integration type when no config exists', () => {
            const unknownType = 'unknown-integration' as IntegrationType
            expect(helpers.getIntegrationDisplayName(unknownType)).toBe(
                'unknown-integration',
            )
        })
    })
})
