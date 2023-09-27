import {applications as mockApplications} from 'fixtures/applications'
import {IntegrationType} from 'models/integration/constants'
import {Integration} from 'models/integration/types'
import {channelsQueryKeys as mockChannelsQueryKeys} from 'models/channel/queries'
import {applicationsQueryKeys as mockApplicationsQueryKeys} from 'models/application/queries'
import {channels as mockChannels} from 'fixtures/channels'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import {
    getApplicationById,
    getApplications,
    getApplicationsByChannel,
    getMessagingConfig,
    hasApplicationForChannel,
} from 'services/applications'
import {getChannelBySlug} from 'services/channels'

jest.mock('api/queryClient', () => ({
    appQueryClient: mockQueryClient({
        cachedData: [
            [mockChannelsQueryKeys.list(), mockChannels],
            [mockApplicationsQueryKeys.list(), mockApplications],
        ],
    }),
}))

describe('services', () => {
    describe('applications', () => {
        describe('getApplications()', () => {
            it('should return an array of applications', () => {
                const applications = getApplications()
                expect(applications).toBeInstanceOf(Array)
                expect(applications).toHaveLength(mockApplications.length)
            })
        })

        describe('getApplicationById()', () => {
            it('should return a application if given a valid ID', () => {
                expect(
                    getApplicationById('64785607477d0a11fc731bfa')
                ).toBeDefined()
            })

            it('should return undefined for invalid inputs', () => {
                expect(getApplicationById('invalid')).toBeUndefined()
            })
        })

        describe('getApplicationsByChannel()', () => {
            it('should return an array of applications for that channel', () => {
                expect(
                    getApplicationsByChannel('tiktok-shop')?.[0]?.name
                ).toEqual('TikTok Shop')
            })
        })

        describe('hasApplicationForChannel()', () => {
            it('should return true if there is an installed application for the given channel', () => {
                expect(hasApplicationForChannel('tiktok-shop')).toEqual(true)
                expect(
                    hasApplicationForChannel(getChannelBySlug('tiktok-shop')!)
                ).toEqual(true)
            })

            it('should return false in case there is no application for the given channel', () => {
                expect(hasApplicationForChannel('sms')).toEqual(false)
            })
        })

        describe('getMessagingConfig()', () => {
            it('should return the messaging config for a given "app" integration', () => {
                const expectedConfig = getApplicationById(
                    '64785607477d0a11fc731bfa'
                )?.messaging_config
                expect(
                    getMessagingConfig({
                        type: 'app',
                        application_id: '64785607477d0a11fc731bfa',
                    } as Integration)
                ).toEqual(expectedConfig)
            })

            it('should (temporarily) return undefined for non-app integrations', () => {
                expect(
                    getMessagingConfig({
                        type: IntegrationType.Facebook,
                    } as Integration)
                ).toBeUndefined()
            })
        })
    })
})
