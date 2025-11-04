import { JourneyTypeEnum } from '@gorgias/convert-client'

import { aiJourneyKeys } from './index'

jest.mock('@repo/utils', () => ({
    isProduction: jest.fn(),
    isStaging: jest.fn(),
}))

jest.mock('@gorgias/convert-client', () => ({
    JourneyTypeEnum: {
        CartAbandoned: 'cart_abandoned',
        SessionAbandoned: 'session_abandoned',
        Campaign: 'campaign',
    },
}))

describe('AIJourney Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('aiJourneyKeys', () => {
        describe('journeys', () => {
            it('should return correct query key for journeys with integration ID', () => {
                const integrationId = 123
                const result = aiJourneyKeys.journeys(integrationId)

                expect(result).toEqual(['journeys', 123, undefined])
            })

            it('should return correct query key for journeys with undefined integration ID', () => {
                const result = aiJourneyKeys.journeys(undefined)

                expect(result).toEqual(['journeys', undefined, undefined])
            })

            it('should return correct query key for journeys with zero integration ID', () => {
                const result = aiJourneyKeys.journeys(0)

                expect(result).toEqual(['journeys', 0, undefined])
            })

            it('should return correct query key for journeys with null integration ID', () => {
                const result = aiJourneyKeys.journeys(null as any)

                expect(result).toEqual(['journeys', null, undefined])
            })

            it('should return correct query key for journeys with types parameter', () => {
                const integrationId = 123
                const types = [
                    JourneyTypeEnum.CartAbandoned,
                    JourneyTypeEnum.SessionAbandoned,
                ]
                const result = aiJourneyKeys.journeys(integrationId, types)

                expect(result).toEqual([
                    'journeys',
                    123,
                    {
                        types: ['cart_abandoned', 'session_abandoned'],
                    },
                ])
            })

            it('should return correct query key for journeys with single type', () => {
                const integrationId = 456
                const types = [JourneyTypeEnum.CartAbandoned]
                const result = aiJourneyKeys.journeys(integrationId, types)

                expect(result).toEqual([
                    'journeys',
                    456,
                    {
                        types: ['cart_abandoned'],
                    },
                ])
            })

            it('should return correct query key for journeys with empty types array', () => {
                const integrationId = 789
                const types: JourneyTypeEnum[] = []
                const result = aiJourneyKeys.journeys(integrationId, types)

                expect(result).toEqual(['journeys', 789, { types: [] }])
            })
        })

        describe('journeyConfiguration', () => {
            it('should return correct query key for journey configuration with journey ID', () => {
                const journeyId = 'journey-123'
                const result = aiJourneyKeys.journeyConfiguration(journeyId)

                expect(result).toEqual(['journeyConfiguration', 'journey-123'])
            })

            it('should return correct query key for journey configuration with undefined journey ID', () => {
                const result = aiJourneyKeys.journeyConfiguration(undefined)

                expect(result).toEqual(['journeyConfiguration', undefined])
            })

            it('should return correct query key for journey configuration with empty string journey ID', () => {
                const result = aiJourneyKeys.journeyConfiguration('')

                expect(result).toEqual(['journeyConfiguration', ''])
            })

            it('should return correct query key for journey configuration with null journey ID', () => {
                const result = aiJourneyKeys.journeyConfiguration(null as any)

                expect(result).toEqual(['journeyConfiguration', null])
            })
        })
    })

    describe('Integration Tests', () => {
        it('should generate consistent query keys for the same inputs', () => {
            const integrationId = 456
            const journeyId = 'journey-456'

            const journeysKey1 = aiJourneyKeys.journeys(integrationId)
            const journeysKey2 = aiJourneyKeys.journeys(integrationId)
            const configKey1 = aiJourneyKeys.journeyConfiguration(journeyId)
            const configKey2 = aiJourneyKeys.journeyConfiguration(journeyId)

            expect(journeysKey1).toEqual(journeysKey2)
            expect(configKey1).toEqual(configKey2)
        })

        it('should generate different query keys for different inputs', () => {
            const journeysKey1 = aiJourneyKeys.journeys(123)
            const journeysKey2 = aiJourneyKeys.journeys(456)
            const configKey1 = aiJourneyKeys.journeyConfiguration('journey-1')
            const configKey2 = aiJourneyKeys.journeyConfiguration('journey-2')

            expect(journeysKey1).not.toEqual(journeysKey2)
            expect(configKey1).not.toEqual(configKey2)
        })

        it('should work with React Query useQuery hooks', () => {
            const integrationId = 789
            const journeyId = 'journey-789'

            const journeysKey = aiJourneyKeys.journeys(integrationId)
            const configKey = aiJourneyKeys.journeyConfiguration(journeyId)

            expect(Array.isArray(journeysKey)).toBe(true)
            expect(Array.isArray(configKey)).toBe(true)

            expect(journeysKey.length).toBe(2)
            expect(configKey.length).toBe(2)

            expect(typeof journeysKey[0]).toBe('string')
            expect(typeof configKey[0]).toBe('string')
        })

        it('should generate different query keys for different types arrays', () => {
            const integrationId = 123
            const types1 = [JourneyTypeEnum.CartAbandoned]
            const types2 = [
                JourneyTypeEnum.CartAbandoned,
                JourneyTypeEnum.SessionAbandoned,
            ]

            const journeysKey1 = aiJourneyKeys.journeys(integrationId, types1)
            const journeysKey2 = aiJourneyKeys.journeys(integrationId, types2)

            expect(journeysKey1).not.toEqual(journeysKey2)
        })
    })
})
