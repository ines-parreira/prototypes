import {RevenueAddonClient} from 'rest_api/revenue_addon_api/client'

import {convertBundle} from 'fixtures/convertBundle'
import * as resources from '../resources'

jest.mock('rest_api/revenue_addon_api/client')

describe('Convert Bundle resources', () => {
    describe('listBundles', () => {
        it('should resolve bundles on success', async () => {
            const client = {
                list_bundle_installation: jest
                    .fn()
                    .mockReturnValue([convertBundle]),
            } as unknown as RevenueAddonClient

            const res = await resources.listBundles(client)
            expect(res).toEqual([convertBundle])
        })
    })
})
