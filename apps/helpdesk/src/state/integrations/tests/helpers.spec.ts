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
import type { InstallationStatus } from 'rest_api/gorgias_chat_protected_api/types'
import type { AccountSettingBusinessHours } from 'state/currentAccount/types'
import { AccountSettingType } from 'state/currentAccount/types'

import { isWellKnownEcomIntegrationIdMisMatch } from '../helpers'
import * as helpers from '../helpers'

const neutralInstallationStatus: InstallationStatus = {
    applicationId: 1,
    hasBeenRequestedOnce: true,
    installed: true,
    installedOnShopifyCheckout: true,
    embeddedSpqInstalled: false,
    minimumSnippetVersion: null,
    isDuringBusinessHours: false,
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
                    neutralInstallationStatus,
                ),
            ).toEqual(GorgiasChatStatusEnum.HIDDEN)
        })

        it('should return `offline` when live chat is auto (regardless of hide_outside_business_hours setting)', () => {
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
                    neutralInstallationStatus,
                ),
            ).toEqual(GorgiasChatStatusEnum.OFFLINE)
        })

        it('should return `offline` when live chat is auto', () => {
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
                    neutralInstallationStatus,
                ),
            ).toEqual(GorgiasChatStatusEnum.OFFLINE)
        })

        it('should return `offline` status when live chat is offline', () => {
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
                    neutralInstallationStatus,
                ),
            ).toEqual(GorgiasChatStatusEnum.OFFLINE)
        })

        it('should return `offline` status when live chat is always online during business hours', () => {
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
                    neutralInstallationStatus,
                ),
            ).toEqual(GorgiasChatStatusEnum.OFFLINE)
        })

        it('should return `offline` when live chat is auto', () => {
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
                    neutralInstallationStatus,
                ),
            ).toEqual(GorgiasChatStatusEnum.OFFLINE)
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
                helpers.computeChatIntegrationStatus(integrationState, {
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
                helpers.computeChatIntegrationStatus(integrationState, {
                    ...neutralInstallationStatus,
                    installed: false,
                }),
            ).toEqual(GorgiasChatStatusEnum.NOT_INSTALLED)
        })

        it('should return `offline` status when chat was removed via 1 click long time ago, but it is somehow installed now', () => {
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
                helpers.computeChatIntegrationStatus(integrationState, {
                    ...neutralInstallationStatus,
                    installed: true,
                }),
            ).toEqual(GorgiasChatStatusEnum.OFFLINE)
        })

        it('should return `installed` status (despite having "installed": false) if chat was installed recently using 1 click installation', () => {
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
                helpers.computeChatIntegrationStatus(integrationState, {
                    ...neutralInstallationStatus,
                    installed: false,
                }),
            ).toEqual(GorgiasChatStatusEnum.INSTALLED)
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
                helpers.computeChatIntegrationStatus(integrationState, {
                    ...neutralInstallationStatus,
                    installed: true,
                }),
            ).toEqual(GorgiasChatStatusEnum.NOT_INSTALLED)
        })

        it('should return `offline` when chat has been installed correctly but is outside business hours', () => {
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
                helpers.computeChatIntegrationStatus(integrationState, {
                    ...neutralInstallationStatus,
                    isDuringBusinessHours: false,
                }),
            ).toEqual(GorgiasChatStatusEnum.OFFLINE)
        })

        it('should return `online` when chat has been installed correctly but is during business hours', () => {
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
                helpers.computeChatIntegrationStatus(integrationState, {
                    ...neutralInstallationStatus,
                    isDuringBusinessHours: true,
                }),
            ).toEqual(GorgiasChatStatusEnum.ONLINE)
        })

        it('should return `offline` when chat is installed and live_chat_availability is set to offline', () => {
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
                helpers.computeChatIntegrationStatus(integrationState, {
                    ...neutralInstallationStatus,
                    installed: true,
                    isDuringBusinessHours: true,
                }),
            ).toEqual(GorgiasChatStatusEnum.OFFLINE)
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

        it('should handle midnight (00:00) as to_time for overnight business hours', () => {
            // Business hours from 22:00 to 00:00 (end of current day)
            const businessHoursSettings = {
                id: 2,
                type: AccountSettingType.BusinessHours,
                data: {
                    business_hours: [
                        {
                            days: '1', // Monday only
                            from_time: '22:00',
                            to_time: '00:00', // end of Monday (23:59:59.999)
                        },
                    ],
                    timezone: 'UTC',
                },
            } as AccountSettingBusinessHours

            // Test 23:00 on Monday (should be true)
            const mondayAt23 = moment('2022-11-21T23:00:00+00:00')
            jest.spyOn(moment, 'tz').mockImplementation(() => mondayAt23)
            expect(
                helpers.isAccountDuringBusinessHours(businessHoursSettings),
            ).toEqual(true)

            // Test 23:59 on Monday (should be true - nearly end of day)
            const mondayAt2359 = moment('2022-11-21T23:59:00+00:00')
            jest.spyOn(moment, 'tz').mockImplementation(() => mondayAt2359)
            expect(
                helpers.isAccountDuringBusinessHours(businessHoursSettings),
            ).toEqual(true)

            // Test 00:00 on Tuesday (should be false - different day)
            const tuesdayAt00 = moment('2022-11-22T00:00:00+00:00')
            jest.spyOn(moment, 'tz').mockImplementation(() => tuesdayAt00)
            expect(
                helpers.isAccountDuringBusinessHours(businessHoursSettings),
            ).toEqual(false)
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

    describe('getStoreIconNameFromType', () => {
        it('should return VendorShopifyColored icon for Shopify integration', () => {
            expect(
                helpers.getStoreIconNameFromType(IntegrationType.Shopify),
            ).toBe('app-shopify')
        })

        it('should return app-bicommerce icon for BigCommerce integration', () => {
            expect(
                helpers.getStoreIconNameFromType(IntegrationType.BigCommerce),
            ).toBe('app-bicommerce')
        })

        it('should return app-magento icon for Magento2 integration', () => {
            expect(
                helpers.getStoreIconNameFromType(IntegrationType.Magento2),
            ).toBe('app-magento')
        })

        it('should return shopping-bag icon for unknown integration types', () => {
            expect(
                helpers.getStoreIconNameFromType(IntegrationType.Email),
            ).toBe('shopping-bag')
            expect(
                helpers.getStoreIconNameFromType(IntegrationType.Facebook),
            ).toBe('shopping-bag')
            expect(
                helpers.getStoreIconNameFromType(
                    'unknown-type' as IntegrationType,
                ),
            ).toBe('shopping-bag')
        })
    })
})
