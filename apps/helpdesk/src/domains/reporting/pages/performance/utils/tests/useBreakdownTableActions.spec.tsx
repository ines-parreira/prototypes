import { render, renderHook } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useBreakdownTableActions } from 'domains/reporting/pages/performance/utils/useBreakdownTableActions'

jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
    () => ({
        ChartsActionMenu: ({
            chartName,
            exportCsvAction,
        }: {
            chartName: string
            exportCsvAction?: { onClick: () => void }
        }) => (
            <div>
                <button type="button">{`${chartName} chart actions`}</button>
                {exportCsvAction ? (
                    <button type="button" onClick={exportCsvAction.onClick}>
                        {`${chartName} export csv`}
                    </button>
                ) : null}
            </div>
        ),
    }),
)

const SEGMENT_EVENT_NAME = 'test_breakdown-table'

const makeDownloadData = (overrides = {}) => ({
    files: { 'file.csv': 'data' },
    fileName: 'file.csv',
    isLoading: false,
    ...overrides,
})

const renderActions = (
    params: {
        chartId?: string
        withChartMenu?: boolean
        downloadData?: ReturnType<typeof makeDownloadData>
    } = {},
) => {
    const { chartId, withChartMenu, downloadData = makeDownloadData() } = params
    const useDownloadData = jest.fn(() => downloadData)
    const hook = renderHook(() =>
        useBreakdownTableActions({
            chartId,
            withChartMenu,
            chartName: 'Agent',
            segmentEventName: SEGMENT_EVENT_NAME,
            useDownloadData,
        }),
    )
    return { ...hook, useDownloadData }
}

describe('useBreakdownTableActions', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('calls the provided download-data hook', () => {
        const { useDownloadData } = renderActions()

        expect(useDownloadData).toHaveBeenCalled()
    })

    describe('when on a dashboard (withChartMenu and chartId)', () => {
        it('returns an action menu and no standalone download button', () => {
            const { result } = renderActions({
                chartId: 'agent-table',
                withChartMenu: true,
            })

            expect(result.current.actionMenu).toBeDefined()
            expect(result.current.DownloadButton).toBeUndefined()
        })

        it('exposes CSV export through the action menu', () => {
            const { result } = renderActions({
                chartId: 'agent-table',
                withChartMenu: true,
            })

            render(<div>{result.current.actionMenu}</div>)

            expect(
                screen.getByRole('button', { name: /agent chart actions/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /agent export csv/i }),
            ).toBeInTheDocument()
        })
    })

    describe('when on the standalone managed page', () => {
        it('returns a download button and no action menu when withChartMenu is false', () => {
            const { result } = renderActions({
                chartId: 'agent-table',
                withChartMenu: false,
            })

            expect(result.current.DownloadButton).toBeDefined()
            expect(result.current.actionMenu).toBeUndefined()
        })

        it('returns a download button when chartId is missing', () => {
            const { result } = renderActions({ withChartMenu: true })

            expect(result.current.DownloadButton).toBeDefined()
            expect(result.current.actionMenu).toBeUndefined()
        })

        it('renders the download button', () => {
            const { result } = renderActions({ withChartMenu: false })

            render(<div>{result.current.DownloadButton}</div>)

            expect(
                screen.getByRole('button', { name: /download/i }),
            ).toBeInTheDocument()
        })

        it('disables the download button while the download data is loading', () => {
            const { result } = renderActions({
                withChartMenu: false,
                downloadData: makeDownloadData({ isLoading: true }),
            })

            render(<div>{result.current.DownloadButton}</div>)

            expect(
                screen.getByRole('button', { name: /download/i }),
            ).toBeDisabled()
        })
    })
})
