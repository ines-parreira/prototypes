import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'

import { AI_AGENT_SENTRY_TEAM } from 'common/const/sentryTeamNames'
import {
    useGetArticleIngestionLogs,
    useGetIngestionLogs,
} from 'models/helpCenter/queries'
import { reportError } from 'utils/errors'
import { assumeMock } from 'utils/testing'

import { useGetStoreDomainIngestionLog } from '../useGetStoreDomainIngestionLog'

jest.mock('models/helpCenter/queries', () => ({
    useGetIngestionLogs: jest.fn(),
}))
const mockUseGetIngestionLogs = assumeMock(useGetIngestionLogs)

jest.mock('utils/errors', () => ({
    reportError: jest.fn(),
}))

const queryClient = new QueryClient()

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useGetStoreDomainIngestionLog', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('returns null log when storeUrl is null', () => {
        mockUseGetIngestionLogs.mockReturnValue({
            data: [],
            error: null,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetArticleIngestionLogs>)

        const { result } = renderHook(
            () =>
                useGetStoreDomainIngestionLog({
                    helpCenterId: 1,
                    storeUrl: null,
                }),
            { wrapper },
        )

        expect(result.current.storeDomainIngestionLog).toBeNull()
        expect(result.current.isIngestionLogsLoading).toBe(false)
    })

    it('returns matching log when storeUrl exists', () => {
        const mockedLogs = [
            {
                source: 'domain',
                url: 'https://store.example.com',
                status: 'SUCCESSFUL',
            },
            {
                source: 'domain',
                url: 'https://faq.example.com',
                status: 'PENDING',
            },
        ]
        mockUseGetIngestionLogs.mockReturnValue({
            data: mockedLogs,
            error: null,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetArticleIngestionLogs>)

        const { result } = renderHook(
            () =>
                useGetStoreDomainIngestionLog({
                    helpCenterId: 1,
                    storeUrl: 'https://store.example.com',
                }),
            { wrapper },
        )

        expect(result.current.storeDomainIngestionLog).toEqual(mockedLogs[0])
        expect(result.current.isIngestionLogsLoading).toBe(false)
    })

    it('reports error if ingestion logs query fails', () => {
        const mockedError = new Error('Test error')
        mockUseGetIngestionLogs.mockReturnValue({
            error: mockedError,
        } as unknown as ReturnType<typeof useGetArticleIngestionLogs>)

        renderHook(
            () =>
                useGetStoreDomainIngestionLog({
                    helpCenterId: 1,
                    storeUrl: 'https://store.example.com',
                }),
            { wrapper },
        )

        expect(reportError).toHaveBeenCalledWith(mockedError, {
            tags: { team: AI_AGENT_SENTRY_TEAM },
            extra: {
                context: 'Error during ingestion logs fetching',
            },
        })
    })
})
