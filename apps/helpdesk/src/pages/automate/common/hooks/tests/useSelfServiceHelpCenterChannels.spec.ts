import { assumeMock, renderHook } from '@repo/testing'

import { TicketChannel } from 'business/types/ticket'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import { HelpCenter } from 'models/helpCenter/types'

import useSelfServiceHelpCenterChannels, {
    SelfServiceHelpCenterChannel,
} from '../useSelfServiceHelpCenterChannels'
import useSelfServiceStoreIntegration from '../useSelfServiceStoreIntegration'

const mockHelpCenter = {
    created_datetime: '2023-12-21T13:01:16.097Z',
    updated_datetime: '2024-04-26T09:16:46.329Z',
    deleted_datetime: null,
    automation_settings_id: 7,
    deactivated_datetime: null,
    default_locale: 'en-US',
    email_integration: {
        id: 5,
        email: 'zp7d01g9zorymjke@email-itay.gorgi.us',
    },
    id: 1,
    name: 'Acme Help Center',
    powered_by_deactivated_datetime: null,
    search_deactivated_datetime: null,
    self_service_deactivated_datetime: null,
    shop_name: 'My Shop',
    subdomain: 'acme',
    supported_locales: ['en-US'],
    type: 'faq',
    layout: 'default',
    account_id: 1,
    translations: [],
    redirects: [],
} as unknown as HelpCenter

jest.mock('models/helpCenter/queries')
jest.mock('../useSelfServiceStoreIntegration')

const mockedUseGetHelpCenterList = assumeMock(useGetHelpCenterList)
const mockedUseSelfServiceStoreIntegration = assumeMock(
    useSelfServiceStoreIntegration,
)

describe('useSelfServiceHelpCenterChannels', () => {
    const shopType = 'shopify'
    const shopName = 'My Shop'

    beforeEach(() => {
        jest.resetAllMocks()
        mockedUseGetHelpCenterList.mockReturnValue({
            data: { data: { data: [mockHelpCenter] } },
        } as unknown as ReturnType<typeof useGetHelpCenterList>)
        mockedUseSelfServiceStoreIntegration.mockReturnValue({
            id: 1,
            name: 'My Shop',
            type: 'shopify',
        } as unknown as ReturnType<typeof useSelfServiceStoreIntegration>)
    })

    it('returns an empty array if storeIntegration is undefined', () => {
        mockedUseSelfServiceStoreIntegration.mockReturnValue(undefined)
        const { result } = renderHook(() =>
            useSelfServiceHelpCenterChannels(shopType, shopName),
        )

        expect(result.current).toEqual([])
    })

    it('returns an empty array if helpCenterList is null', () => {
        mockedUseGetHelpCenterList.mockReturnValue({
            data: null,
        } as unknown as ReturnType<typeof useGetHelpCenterList>)
        const { result } = renderHook(() =>
            useSelfServiceHelpCenterChannels(shopType, shopName),
        )

        expect(result.current).toEqual([])
    })

    it('returns filtered and mapped help centers when storeIntegration is present', () => {
        const { result } = renderHook(() =>
            useSelfServiceHelpCenterChannels(shopType, shopName),
        )

        const expectedResult: SelfServiceHelpCenterChannel[] = [
            {
                type: TicketChannel.HelpCenter,
                value: mockHelpCenter,
            },
        ]

        expect(result.current).toEqual(expectedResult)
    })

    it('returns an empty array if no help centers match the given shop name', () => {
        mockedUseSelfServiceStoreIntegration.mockReturnValue({
            id: 1,
            name: 'My Other Shop',
            type: 'shopify',
        } as unknown as ReturnType<typeof useSelfServiceStoreIntegration>)

        const { result } = renderHook(() =>
            useSelfServiceHelpCenterChannels(shopType, shopName + 'temp'),
        )

        expect(result.current).toEqual([])
    })
})
