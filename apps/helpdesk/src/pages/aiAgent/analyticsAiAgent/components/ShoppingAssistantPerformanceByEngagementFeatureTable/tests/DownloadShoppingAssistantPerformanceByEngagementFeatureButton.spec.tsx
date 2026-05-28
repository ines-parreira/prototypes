import { render, renderHook } from '@repo/testing'

import '@testing-library/react'

import {
    DownloadShoppingAssistantPerformanceByEngagementFeatureButton,
    useDownloadShoppingAssistantPerformanceByEngagementFeatureAction,
} from 'pages/aiAgent/analyticsAiAgent/components/ShoppingAssistantPerformanceByEngagementFeatureTable/DownloadShoppingAssistantPerformanceByEngagementFeatureButton'

const mockDownloadTableButton = jest.fn()
const mockUseDownloadTableAction = jest.fn()

jest.mock(
    'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton',
    () => ({
        DownloadTableButton: (props: unknown) => mockDownloadTableButton(props),
        useDownloadTableAction: (...args: unknown[]) =>
            mockUseDownloadTableAction(...args),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantPerformanceByEngagementFeatureData',
)

const mockUseDownloadShoppingAssistantPerformanceByEngagementFeatureData =
    jest.requireMock(
        'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantPerformanceByEngagementFeatureData',
    )
        .useDownloadShoppingAssistantPerformanceByEngagementFeatureData as jest.Mock

const mockFiles = {
    'report.csv': '"Engagement feature"\r\n"Search bar"',
}
const mockFileName =
    '2024-01-01_2024-01-31-shopping_assistant_performance_by_engagement_feature_table.csv'

beforeEach(() => {
    mockUseDownloadShoppingAssistantPerformanceByEngagementFeatureData.mockReturnValue(
        {
            files: mockFiles,
            fileName: mockFileName,
            isLoading: false,
        },
    )
})

describe('useDownloadShoppingAssistantPerformanceByEngagementFeatureAction', () => {
    it('calls useDownloadTableAction with data from the hook and the correct segment event name', () => {
        const mockResult = { onClick: jest.fn(), isLoading: false }
        mockUseDownloadTableAction.mockReturnValue(mockResult)

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantPerformanceByEngagementFeatureAction(),
        )

        expect(mockUseDownloadTableAction).toHaveBeenCalledWith({
            files: mockFiles,
            fileName: mockFileName,
            isLoading: false,
            segmentEventName:
                'ai-agent_shopping-assistant_engagement-feature-breakdown-table',
        })
        expect(result.current).toBe(mockResult)
    })
})

describe('DownloadShoppingAssistantPerformanceByEngagementFeatureButton', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes files and fileName from the hook to DownloadTableButton', () => {
        render(
            <DownloadShoppingAssistantPerformanceByEngagementFeatureButton />,
        )

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                files: mockFiles,
                fileName: mockFileName,
            }),
        )
    })

    it('passes isLoading from the hook', () => {
        mockUseDownloadShoppingAssistantPerformanceByEngagementFeatureData.mockReturnValue(
            {
                files: {},
                fileName: mockFileName,
                isLoading: true,
            },
        )

        render(
            <DownloadShoppingAssistantPerformanceByEngagementFeatureButton />,
        )

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({ isLoading: true }),
        )
    })

    it('passes the correct segmentEventName', () => {
        render(
            <DownloadShoppingAssistantPerformanceByEngagementFeatureButton />,
        )

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                segmentEventName:
                    'ai-agent_shopping-assistant_engagement-feature-breakdown-table',
            }),
        )
    })
})
