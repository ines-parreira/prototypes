import React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'

import { dummyAppListData } from 'fixtures/apps'
import { useGetApps, useGetAppsByIds } from 'models/integration/queries'
import { useListActionsApps } from 'models/workflows/queries'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import useGetAppImageUrl from '../useGetAppImageUrl'

jest.mock('models/integration/queries')
jest.mock('models/workflows/queries')

const queryClient = mockQueryClient()
const mockUseGetApps = jest.mocked(useGetApps)
const mockUseGetAppsByIds = jest.mocked(useGetAppsByIds)
const mockUseListActionsApps = jest.mocked(useListActionsApps)

describe('useGetAppImageUrl', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should get app image url', () => {
        mockUseGetApps.mockReturnValue({
            data: [dummyAppListData],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetApps>)

        mockUseListActionsApps.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useListActionsApps>)

        mockUseGetAppsByIds.mockReturnValue([])

        const { result } = renderHook(
            () =>
                useGetAppImageUrl({
                    type: 'shopify',
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            },
        )

        expect(result.current).toEqual('/assets/img/integrations/shopify.png')
    })
})
