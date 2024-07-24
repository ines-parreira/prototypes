import {getCampaignStatus} from 'pages/stats/convert/utils/getCampaignStatus'
import {Campaign, InferredCampaignStatus} from 'models/convert/campaign/types'

describe('getCampaignStatus', () => {
    it.each(['active', 'inactive'])(
        'should return Deleted status if campaign has deleted_datetime ignoring previous status: %s',
        (status) => {
            const campaign = {
                deleted_datetime: '2021-01-01T00:00:00Z',
                status: status,
            }

            const result = getCampaignStatus(campaign as Campaign)

            expect(result).toBe(InferredCampaignStatus.Deleted)
        }
    )

    it('should return Active status if campaign has status active', () => {
        const campaign = {
            deleted_datetime: null,
            status: 'active',
        }

        const result = getCampaignStatus(campaign as Campaign)

        expect(result).toBe(InferredCampaignStatus.Active)
    })

    it('should return Inactive status if campaign has status inactive', () => {
        const campaign = {
            deleted_datetime: null,
            status: 'inactive',
        }

        const result = getCampaignStatus(campaign as Campaign)

        expect(result).toBe(InferredCampaignStatus.Inactive)
    })
})
