import {hasConvertBundleInstalled} from 'pages/settings/revenue/utils/hasConvertBundleInstalled'

function mockRevenueAddonApiClient() {
    return {
        list_bundle_installation: jest
            .fn()
            .mockResolvedValueOnce({
                data: [
                    {
                        id: 'ac424a3d-be3f-4b15-9a17-880875db3bdd',
                        account_id: 1,
                        shop_integration_id: 1,
                        status: 'installed',
                        config: {},
                        created_datetime: '2023-05-19T15:13:28.573231',
                        deactivated_datetime: null,
                        bundle_url: 'https://test.com/loader.js',
                    },
                ],
            })
            .mockResolvedValueOnce({
                data: [],
            }),
    }
}

jest.mock('rest_api/revenue_addon_api/client', () => {
    return {
        getRevenueAddonApiClient: jest
            .fn()
            .mockResolvedValue(mockRevenueAddonApiClient()),
    }
})

describe('hasConvertBundleInstalled', () => {
    it('return true', async () => {
        expect(await hasConvertBundleInstalled()).toBe(true)
    })

    it('return false', async () => {
        expect(await hasConvertBundleInstalled()).toBe(false)
    })
})
