import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'

import { useGetHelpCenterCategoryTree } from 'models/helpCenter/queries'
import type { Category } from 'models/helpCenter/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import useHelpCenterArticleTree from '../useHelpCenterArticleTree'

jest.mock('models/helpCenter/queries')

const mockUseGetHelpCenterCategoryTree = assumeMock(
    useGetHelpCenterCategoryTree,
)

const queryClient = mockQueryClient()
const wrapper = ({ children }: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useHelpCenterArticleTree', () => {
    const data: Category = {
        available_locales: ['en-US'],
        created_datetime: new Date().toISOString(),
        updated_datetime: new Date().toISOString(),
        unlisted_id: '1',
        children: [],
        help_center_id: 1,
        id: 1,
        articleCount: 1,
        articles: [],
        translation: null,
    }

    mockUseGetHelpCenterCategoryTree.mockReturnValue({
        data,
    } as unknown as ReturnType<typeof useGetHelpCenterCategoryTree>)
    it('should return empty articles', () => {
        const { result } = renderHook(
            () => useHelpCenterArticleTree(1, 'en-US'),
            {
                wrapper,
            },
        )

        expect(result.current.map).toMatchObject(
            new Map([
                [-1, 'No relevant articles'],
                [0, 'All Articles'],
            ]),
        )
    })
})
