import {abGroup} from 'fixtures/abGroup'
import {RevenueAddonClient} from 'rest_api/revenue_addon_api/client'

import * as resources from '../resources'

jest.mock('rest_api/revenue_addon_api/client')

describe('A/B Group resources', () => {
    it.each([
        [
            'create_ab_group',
            'createABGroup',
            {
                campaign_id: '1',
            },
        ],
        [
            'start_ab_group',
            'startABGroup',
            {
                campaign_id: '1',
            },
        ],
        [
            'pause_ab_group',
            'pauseABGroup',
            {
                campaign_id: '1',
            },
        ],
    ] as const)(
        'should resolve with the %s on success',
        async (mockedMethod, mockedResource, param) => {
            const client = {
                [mockedMethod]: jest.fn().mockReturnValue(abGroup),
            } as unknown as RevenueAddonClient

            const res = await resources[mockedResource](client, param)

            expect(res).toEqual(abGroup)
        }
    )

    describe('stop A/B group', () => {
        it('should resolve with the stopped A/B group on success', async () => {
            const client = {
                stop_ab_group: jest.fn().mockReturnValue(abGroup),
            } as unknown as RevenueAddonClient

            const res = await resources.stopABGroup(
                client,
                {
                    campaign_id: '1',
                },
                {winner_variant_id: '1'}
            )

            expect(res).toEqual(abGroup)
        })
    })
})
