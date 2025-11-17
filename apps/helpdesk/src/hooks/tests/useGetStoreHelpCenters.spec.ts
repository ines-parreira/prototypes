import { assumeMock, renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'

import { useGetHelpCentersIntegrationIdsForStore } from 'hooks/helpCenter/useGetStoreHelpCenters'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import type { HelpCentersListPage } from 'models/helpCenter/types'

jest.mock('models/helpCenter/queries')

const useGetHelpCenterListMock = assumeMock(useGetHelpCenterList)

describe('useGetHelpCentersIntegrationIdsForStore', () => {
    const mockHelpCenterListData = {
        data: {
            data: [
                {
                    shop_name: 'shop1',
                    integration_id: 1,
                    email_integration: { id: 101 },
                },
                {
                    shop_name: 'shop2',
                    integration_id: 2,
                    email_integration: { id: 102 },
                },
                {
                    shop_name: 'shop1',
                    integration_id: 3,
                    email_integration: { id: 103 },
                },
            ],
        },
    }

    beforeEach(() => {
        useGetHelpCenterListMock.mockReturnValue({
            data: mockHelpCenterListData,
            status: 'success',
        } as UseQueryResult<
            AxiosResponse<HelpCentersListPage, any> | null,
            unknown
        >)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return help center integration ids for the given shop name', () => {
        const { result } = renderHook(() =>
            useGetHelpCentersIntegrationIdsForStore({ shopName: 'shop1' }),
        )
        expect(result.current).toEqual({
            helpCentersIntegrationsWithName: [
                { id: 1, channel: 'help-center' },
                { id: 3, channel: 'help-center' },
            ],
            helpCentersIntegrationsWithoutName: [
                { id: 2, email_id: 102, channel: 'help-center' },
            ],
        })
    })

    it('should return an empty array if no help centers match the shop name', () => {
        const { result } = renderHook(() =>
            useGetHelpCentersIntegrationIdsForStore({ shopName: 'shop3' }),
        )
        expect(result.current).toEqual({
            helpCentersIntegrationsWithName: [],
            helpCentersIntegrationsWithoutName: [
                { id: 1, email_id: 101, channel: 'help-center' },
                { id: 2, email_id: 102, channel: 'help-center' },
                { id: 3, email_id: 103, channel: 'help-center' },
            ],
        })
    })
})
