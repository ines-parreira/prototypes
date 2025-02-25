import { Campaign, InferredCampaignStatus } from 'models/convert/campaign/types'
import { getCampaignStatus } from 'pages/stats/convert/utils/getCampaignStatus'

describe('getCampaignStatus', () => {
    const TIMEZONE = 'UTC'

    it.each(['active', 'inactive'])(
        'should return Deleted status if campaign has deleted_datetime ignoring previous status: %s',
        (status) => {
            const campaign = {
                deleted_datetime: '2021-01-01T00:00:00Z',
                status: status,
            }

            const result = getCampaignStatus(campaign as Campaign, TIMEZONE)

            expect(result).toBe(InferredCampaignStatus.Deleted)
        },
    )

    it('should return Active status if campaign has status active', () => {
        const campaign = {
            deleted_datetime: null,
            status: 'active',
        }

        const result = getCampaignStatus(campaign as Campaign, TIMEZONE)

        expect(result).toBe(InferredCampaignStatus.Active)
    })

    it('should return Inactive status if campaign has status inactive', () => {
        const campaign = {
            deleted_datetime: null,
            status: 'inactive',
        }

        const result = getCampaignStatus(campaign as Campaign, TIMEZONE)

        expect(result).toBe(InferredCampaignStatus.Inactive)
    })

    describe('Campaign has schedule configuration', () => {
        it('current date is within defined date range', () => {
            jest.useFakeTimers().setSystemTime(new Date('2024-09-11T10:57:44'))

            const campaign = {
                deleted_datetime: null,
                status: 'active',
                schedule: {
                    start_datetime: '2024-09-10T09:57:44.284000',
                    end_datetime: null,
                },
            }

            const result = getCampaignStatus(campaign as Campaign, TIMEZONE)

            expect(result).toBe(InferredCampaignStatus.Active)
        })
        it('current date is past definied range', () => {
            jest.useFakeTimers().setSystemTime(new Date('2024-09-17T10:57:44'))

            const campaign = {
                deleted_datetime: null,
                status: 'active',
                schedule: {
                    start_datetime: '2024-09-10T09:57:44.284000',
                    end_datetime: '2024-09-16T09:57:44.284000',
                },
            }

            const result = getCampaignStatus(campaign as Campaign, TIMEZONE)

            expect(result).toBe(InferredCampaignStatus.Inactive)
        })
        it('current date is before start date', () => {
            jest.useFakeTimers().setSystemTime(new Date('2024-09-08T10:57:44'))

            const campaign = {
                deleted_datetime: null,
                status: 'active',
                schedule: {
                    start_datetime: '2024-09-10T09:57:44.284000',
                },
            }

            const result = getCampaignStatus(campaign as Campaign, TIMEZONE)

            expect(result).toBe(InferredCampaignStatus.Scheduled)
        })
    })
})
