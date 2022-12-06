import {fromJS} from 'immutable'
import moment from 'moment-timezone'

import {
    GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
    GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
    GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
} from 'config/integrations/gorgias_chat'
import {account} from 'fixtures/account'
import {GorgiasChatStatusEnum} from 'models/integration/types'
import {
    AccountSettingBusinessHours,
    AccountSettingType,
} from 'state/currentAccount/types'
import * as helpers from '../helpers'

describe('integrations helpers', () => {
    describe('computeChatIntegrationStatus()', () => {
        it('should return `hidden` status when chat is deactivated', () => {
            const integrationState = fromJS({
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
                helpers.computeChatIntegrationStatus(integrationState, true)
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
                helpers.computeChatIntegrationStatus(integrationState, false)
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
                helpers.computeChatIntegrationStatus(integrationState, false)
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
                helpers.computeChatIntegrationStatus(integrationState, true)
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
                helpers.computeChatIntegrationStatus(integrationState, true)
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
                helpers.computeChatIntegrationStatus(integrationState, true)
            ).toEqual(null)
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
                helpers.isAccountDuringBusinessHours(businessHoursSettings)
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
                fixedUtcDate.clone().tz(timezone)
            )

            const businessHoursSettings = account
                .settings[0] as AccountSettingBusinessHours
            expect(
                helpers.isAccountDuringBusinessHours(businessHoursSettings)
            ).toEqual(expected)
        })
    })
})
