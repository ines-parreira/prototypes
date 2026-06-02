import { renderHook } from '@repo/testing'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { saveFileAsDownloaded } from 'utils/file'

import { useSkillPerformanceTrendExport } from './useSkillPerformanceTrendExport'
import { useSkillPerformanceTrendFromContext } from './useSkillPerformanceTrendFromContext'

jest.mock('./useSkillPerformanceTrendFromContext', () => ({
    useSkillPerformanceTrendFromContext: jest.fn(),
}))

jest.mock('domains/reporting/hooks/common/utils', () => ({
    getCsvFileNameWithDates: jest.fn(() => 'mocked-filename.csv'),
}))

jest.mock('utils/file', () => ({
    ...jest.requireActual('utils/file'),
    saveFileAsDownloaded: jest.fn(),
}))

const mockUseSkillPerformanceTrendFromContext =
    useSkillPerformanceTrendFromContext as jest.Mock
const mockGetCsvFileNameWithDates = getCsvFileNameWithDates as jest.Mock
const mockSaveFileAsDownloaded = saveFileAsDownloaded as jest.Mock

const mockDateRange = {
    start_datetime: '2026-04-01T00:00:00Z',
    end_datetime: '2026-04-28T23:59:59Z',
}

const mockChartData = [
    { date: '2026-04-20', ticketVolume: 34, csat: 4.2 },
    { date: '2026-04-21', ticketVolume: 99, csat: 4.55 },
    { date: '2026-04-22', ticketVolume: 12, csat: null },
]

describe('useSkillPerformanceTrendExport', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseSkillPerformanceTrendFromContext.mockReturnValue({
            chartData: mockChartData,
            dateRange: mockDateRange,
            isLoading: false,
        })
    })

    describe('isLoading', () => {
        it('mirrors the trend hook so the LazyCsvExporter can wait for data', () => {
            mockUseSkillPerformanceTrendFromContext.mockReturnValue({
                chartData: [],
                dateRange: mockDateRange,
                isLoading: true,
            })

            const { result } = renderHook(() =>
                useSkillPerformanceTrendExport(),
            )

            expect(result.current.isLoading).toBe(true)
        })

        it('is false once trend data has resolved', () => {
            const { result } = renderHook(() =>
                useSkillPerformanceTrendExport(),
            )

            expect(result.current.isLoading).toBe(false)
        })
    })

    describe('triggerDownload', () => {
        it('builds the CSV filename via getCsvFileNameWithDates with the trend date range and a skill-performance-trend slug', async () => {
            const { result } = renderHook(() =>
                useSkillPerformanceTrendExport(),
            )

            await result.current.triggerDownload()

            expect(mockGetCsvFileNameWithDates).toHaveBeenCalledWith(
                mockDateRange,
                'skill-performance-trend',
            )
        })

        it('writes the CSV to disk via saveFileAsDownloaded with the text/csv content type', async () => {
            const { result } = renderHook(() =>
                useSkillPerformanceTrendExport(),
            )

            await result.current.triggerDownload()

            expect(mockSaveFileAsDownloaded).toHaveBeenCalledWith(
                'mocked-filename.csv',
                expect.any(String),
                'text/csv',
            )
        })

        it('writes a CSV whose first row is the Date / Tickets / CSAT header', async () => {
            const { result } = renderHook(() =>
                useSkillPerformanceTrendExport(),
            )

            await result.current.triggerDownload()

            const [, csv] = mockSaveFileAsDownloaded.mock.calls[0] ?? []
            const firstLine = (csv as string).split(/\r\n/)[0]
            expect(firstLine).toBe('"Date","Tickets","CSAT"')
        })

        it('writes one row per chart point in the order returned by the trend hook', async () => {
            const { result } = renderHook(() =>
                useSkillPerformanceTrendExport(),
            )

            await result.current.triggerDownload()

            const [, csv] = mockSaveFileAsDownloaded.mock.calls[0] ?? []
            const lines = (csv as string).split(/\r\n/)
            // 1 header + 3 data rows.
            expect(lines).toHaveLength(4)
            expect(lines[1]).toBe('"2026-04-20","34","4.2"')
            expect(lines[2]).toBe('"2026-04-21","99","4.55"')
        })

        it('renders null CSAT values as an empty string so spreadsheets do not show "null"', async () => {
            const { result } = renderHook(() =>
                useSkillPerformanceTrendExport(),
            )

            await result.current.triggerDownload()

            const [, csv] = mockSaveFileAsDownloaded.mock.calls[0] ?? []
            const lines = (csv as string).split(/\r\n/)
            // The CSAT column on the last row is null in the fixture.
            expect(lines[3]).toBe('"2026-04-22","12",""')
        })

        it('is a no-op when there is no chart data to export', async () => {
            mockUseSkillPerformanceTrendFromContext.mockReturnValue({
                chartData: [],
                dateRange: mockDateRange,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useSkillPerformanceTrendExport(),
            )

            await result.current.triggerDownload()

            expect(mockSaveFileAsDownloaded).not.toHaveBeenCalled()
        })
    })
})
