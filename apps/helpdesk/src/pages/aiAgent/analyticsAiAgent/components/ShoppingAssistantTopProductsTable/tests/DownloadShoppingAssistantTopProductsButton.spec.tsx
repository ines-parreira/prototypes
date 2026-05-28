import { assumeMock, render, renderHook } from '@repo/testing'

import '@testing-library/react'

import { useDownloadShoppingAssistantTopProductsData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantTopProductsData'
import {
    DownloadTableButton,
    useDownloadTableAction,
} from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'

import {
    DownloadShoppingAssistantTopProductsButton,
    useDownloadShoppingAssistantTopProductsAction,
} from '../DownloadShoppingAssistantTopProductsButton'

jest.mock(
    'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton',
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantTopProductsData',
)

const mockDownloadTableButton = assumeMock(DownloadTableButton)
const mockUseDownloadTableAction = assumeMock(useDownloadTableAction)
const mockUseDownloadShoppingAssistantTopProductsData = assumeMock(
    useDownloadShoppingAssistantTopProductsData,
)

const mockFiles = {
    'report.csv': '"Times recommended"\r\n"100"',
}
const mockFileName =
    '2024-01-01_2024-01-31-ai-agent-shopping-assistant-top-products.csv'

beforeEach(() => {
    jest.clearAllMocks()
    mockDownloadTableButton.mockReturnValue(<></>)
    mockUseDownloadShoppingAssistantTopProductsData.mockReturnValue({
        files: mockFiles,
        fileName: mockFileName,
        isLoading: false,
    })
})

describe('useDownloadShoppingAssistantTopProductsAction', () => {
    it('calls useDownloadTableAction with data from the hook and the correct segment event name', () => {
        const mockResult = { onClick: jest.fn(), isLoading: false }
        mockUseDownloadTableAction.mockReturnValue(mockResult)

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantTopProductsAction(),
        )

        expect(mockUseDownloadTableAction).toHaveBeenCalledWith({
            files: mockFiles,
            fileName: mockFileName,
            isLoading: false,
            segmentEventName: 'ai-agent_shopping-assistant_top-products-table',
        })
        expect(result.current).toBe(mockResult)
    })
})

describe('DownloadShoppingAssistantTopProductsButton', () => {
    it('passes files and fileName from the hook to DownloadTableButton', () => {
        render(<DownloadShoppingAssistantTopProductsButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                files: mockFiles,
                fileName: mockFileName,
            }),
            expect.anything(),
        )
    })

    it('passes isLoading from the hook', () => {
        mockUseDownloadShoppingAssistantTopProductsData.mockReturnValue({
            files: {},
            fileName: mockFileName,
            isLoading: true,
        })

        render(<DownloadShoppingAssistantTopProductsButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({ isLoading: true }),
            expect.anything(),
        )
    })

    it('passes the correct segmentEventName', () => {
        render(<DownloadShoppingAssistantTopProductsButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                segmentEventName:
                    'ai-agent_shopping-assistant_top-products-table',
            }),
            expect.anything(),
        )
    })
})
