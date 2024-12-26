import {QueryClientProvider} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import React from 'react'

import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {useSearchParam} from 'hooks/useSearchParam'
import {useGetArticleIngestionLogs} from 'models/helpCenter/queries'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {reportError} from 'utils/errors'
import {assumeMock} from 'utils/testing'

import {useAiAgentNavigation} from '../useAiAgentNavigation'
import {usePublicResourcesPooling} from '../usePublicResourcesPooling'

const queryClient = mockQueryClient()

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('pages/history')
jest.mock('state/notifications/actions')

jest.mock('utils/errors', () => ({
    reportError: jest.fn(),
}))

jest.mock('../useAiAgentNavigation')
const mockUseAiAgentNavigation = assumeMock(useAiAgentNavigation)

jest.mock('models/helpCenter/queries', () => ({
    useGetArticleIngestionLogs: jest.fn(),
}))
const mockUseGetArticleIngestionLogs = assumeMock(useGetArticleIngestionLogs)

jest.mock('hooks/useSearchParam')
const mockUseSearchParam = assumeMock(useSearchParam)

describe('usePublicResourcesPooling', () => {
    const shopName = 'test-shop'
    const helpCenterId = 1
    beforeEach(() => {
        jest.resetAllMocks()
        window.location.pathname = `/app/automation/shopify/${shopName}/ai-agent/new`
        mockUseAiAgentNavigation.mockReturnValue({
            routes: {
                test: `/app/automation/shopify/${shopName}/ai-agent/test`,
                configuration: () =>
                    `/app/automation/shopify/${shopName}/ai-agent?section=${shopName}`,
                onboardingWizard: `/app/automation/shopify/${shopName}/ai-agent/new`,
            },
        } as unknown as ReturnType<typeof useAiAgentNavigation>)
        mockUseGetArticleIngestionLogs.mockReturnValue({
            data: [
                {id: 1, status: 'PENDING'},
                {id: 2, status: 'SUCCESSFUL'},
            ],
        } as unknown as ReturnType<typeof useGetArticleIngestionLogs>)
        mockUseSearchParam.mockReturnValue([null, jest.fn()])
    })

    const setupHook = (shopName: string, helpCenterId: number) => {
        return renderHook(
            () => usePublicResourcesPooling({shopName, helpCenterId}),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            }
        )
    }

    it('should report an error if article ingestion logs fetching fails', () => {
        const mockedError = new Error('Test error')
        mockUseGetArticleIngestionLogs.mockReturnValue({
            error: mockedError,
        } as unknown as ReturnType<typeof useGetArticleIngestionLogs>)

        setupHook(shopName, helpCenterId)

        expect(reportError).toHaveBeenCalledWith(mockedError, {
            tags: {team: AI_AGENT_SENTRY_TEAM},
            extra: {context: 'Error during article ingestion logs pooling'},
        })
    })

    it('should call the notify action with syncing message when logs are pending', () => {
        setupHook(shopName, helpCenterId)

        expect(notify).toHaveBeenCalledWith({
            status: NotificationStatus.Loading,
            message:
                'Syncing in progress. You can finish onboarding while sources are syncing.',
            showDismissButton: true,
            dismissible: true,
        })
    })
})
