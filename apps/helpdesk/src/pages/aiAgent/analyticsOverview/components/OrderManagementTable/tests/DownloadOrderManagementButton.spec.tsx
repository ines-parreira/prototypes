import { render } from '@repo/testing'

import '@testing-library/react'

import {
    DownloadOrderManagementButton,
    useDownloadOrderManagementAction,
} from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/DownloadOrderManagementButton'

const mockDownloadTableButton = jest.fn((__props: unknown) => null)
const mockUseDownloadTableAction = jest.fn()

jest.mock(
    'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton',
    () => ({
        DownloadTableButton: (props: unknown) => mockDownloadTableButton(props),
        useDownloadTableAction: (props: unknown) =>
            mockUseDownloadTableAction(props),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useDownloadOrderManagementData',
)

const mockUseDownloadOrderManagementData = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/useDownloadOrderManagementData',
).useDownloadOrderManagementData as jest.Mock

const mockFiles = { 'report.csv': '"Order management"\r\n"Cancel order"' }
const mockFileName = '2024-01-01_2024-01-31-order-management-table.csv'

beforeEach(() => {
    mockUseDownloadOrderManagementData.mockReturnValue({
        files: mockFiles,
        fileName: mockFileName,
        isLoading: false,
    })
    mockUseDownloadTableAction.mockReturnValue({
        onClick: jest.fn(),
        isLoading: false,
    })
})

describe('DownloadOrderManagementButton', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes files and fileName from the hook to DownloadTableButton', () => {
        render(<DownloadOrderManagementButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                files: mockFiles,
                fileName: mockFileName,
            }),
        )
    })

    it('passes isLoading from the hook to DownloadTableButton', () => {
        mockUseDownloadOrderManagementData.mockReturnValue({
            files: {},
            fileName: mockFileName,
            isLoading: true,
        })

        render(<DownloadOrderManagementButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({ isLoading: true }),
        )
    })

    it('passes the correct segmentEventName to DownloadTableButton', () => {
        render(<DownloadOrderManagementButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                segmentEventName: 'ai-agent_overview_order-management-table',
            }),
        )
    })
})

describe('useDownloadOrderManagementAction', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('delegates to useDownloadTableAction with the correct segmentEventName', () => {
        render(<DownloadOrderManagementButton />)
        useDownloadOrderManagementAction()

        expect(mockUseDownloadTableAction).toHaveBeenCalledWith(
            expect.objectContaining({
                segmentEventName: 'ai-agent_overview_order-management-table',
                files: mockFiles,
                fileName: mockFileName,
                isLoading: false,
            }),
        )
    })

    it('passes isLoading through to useDownloadTableAction', () => {
        mockUseDownloadOrderManagementData.mockReturnValue({
            files: {},
            fileName: mockFileName,
            isLoading: true,
        })

        render(<DownloadOrderManagementButton />)
        useDownloadOrderManagementAction()

        expect(mockUseDownloadTableAction).toHaveBeenCalledWith(
            expect.objectContaining({ isLoading: true }),
        )
    })
})
