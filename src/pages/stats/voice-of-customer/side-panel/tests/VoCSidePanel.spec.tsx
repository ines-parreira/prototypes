import { fireEvent, screen, waitFor } from '@testing-library/react'

import { DrillDownModal } from 'pages/stats/common/drill-down/DrillDownModal'
import { TREND_OVERVIEW_LABEL } from 'pages/stats/voice-of-customer/side-panel/constants'
import { InsightsTab } from 'pages/stats/voice-of-customer/side-panel/InsightsTab'
import {
    VoCSidePanel,
    VoCSidePanelTabs,
} from 'pages/stats/voice-of-customer/side-panel/VoCSidePanel'
import { ProductHeader } from 'pages/stats/voice-of-customer/TrendOverview/ProductHeader'
import { TrendOverviewReport } from 'pages/stats/voice-of-customer/TrendOverview/TrendOverviewReport'
import {
    closeSidePanel,
    setSidePanelActiveTab,
    SidePanelTab,
} from 'state/ui/stats/sidePanelSlice'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('pages/stats/voice-of-customer/TrendOverview/ProductHeader')
const ProductHeaderMock = assumeMock(ProductHeader)

jest.mock('pages/stats/voice-of-customer/side-panel/InsightsTab')
const InsightsTabMock = assumeMock(InsightsTab)

jest.mock('pages/stats/common/drill-down/DrillDownModal')
const DrillDownModalMock = assumeMock(DrillDownModal)

jest.mock('pages/stats/voice-of-customer/TrendOverview/TrendOverviewReport')
const TrendOverviewReportMock = assumeMock(TrendOverviewReport)

describe('VoCSidePanel', () => {
    const product = { id: '123', name: 'product name' }
    const defaultState = {
        ui: {
            stats: {
                sidePanel: {
                    product: null,
                    activeTab: SidePanelTab.Insights,
                },
            },
        },
    }

    beforeEach(() => {
        DrillDownModalMock.mockImplementation(() => <div />)
        TrendOverviewReportMock.mockImplementation(() => <div />)
        ProductHeaderMock.mockImplementation(() => <div />)
        InsightsTabMock.mockImplementation(() => <div />)
    })

    it('renders with default props', () => {
        renderWithStore(<VoCSidePanel />, defaultState as any)

        expect(
            screen.getByText(VoCSidePanelTabs[SidePanelTab.Insights].label),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                VoCSidePanelTabs[SidePanelTab.TrendOverview].label,
            ),
        ).toBeInTheDocument()
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        expect(ProductHeaderMock).not.toHaveBeenCalled()
    })

    it('renders ProductHeader', () => {
        const state = JSON.parse(JSON.stringify(defaultState))
        state.ui.stats.sidePanel.product = product as any

        renderWithStore(<VoCSidePanel />, state as any)

        expect(ProductHeaderMock).toHaveBeenCalledWith(
            expect.objectContaining({ product }),
            expect.anything(),
        )
    })

    it('renders with default active tab', () => {
        const state = JSON.parse(JSON.stringify(defaultState))
        state.ui.stats.sidePanel.product = product as any

        renderWithStore(<VoCSidePanel />, state as any)

        expect(InsightsTabMock).toHaveBeenCalled()
    })

    it('renders with custom active tab', () => {
        const state = JSON.parse(JSON.stringify(defaultState))
        state.ui.stats.sidePanel.product = product as any
        state.ui.stats.sidePanel.activeTab = SidePanelTab.TrendOverview

        renderWithStore(<VoCSidePanel />, state as any)

        expect(TrendOverviewReportMock).toHaveBeenCalled()
    })

    it('handles close button click', async () => {
        const state = JSON.parse(JSON.stringify(defaultState))
        state.ui.stats.sidePanel.product = product as any

        const { store } = renderWithStore(<VoCSidePanel />, state as any)

        const closeButton = screen.getByText(/keyboard_tab/)

        fireEvent.click(closeButton)

        await waitFor(() => {
            expect(store.getActions()).toEqual(
                expect.arrayContaining([closeSidePanel()]),
            )
        })
    })

    it('handles backdrop click', async () => {
        const state = JSON.parse(JSON.stringify(defaultState))
        state.ui.stats.sidePanel.product = product as any

        const { store } = renderWithStore(<VoCSidePanel />, state as any)

        const backdrop = document.querySelector('.backdrop')

        if (backdrop) {
            fireEvent.click(backdrop)
        }

        await waitFor(() => {
            expect(store.getActions()).toEqual(
                expect.arrayContaining([closeSidePanel()]),
            )
        })
    })

    it('dispatches setSidePanelActiveTab when tab is changed', async () => {
        const state = JSON.parse(JSON.stringify(defaultState))
        state.ui.stats.sidePanel.product = product as any

        const { store } = renderWithStore(<VoCSidePanel />, state as any)

        const trendOverviewTab = screen.getByText(TREND_OVERVIEW_LABEL)
        fireEvent.focus(trendOverviewTab)

        await waitFor(() => {
            expect(store.getActions()).toEqual(
                expect.arrayContaining([
                    setSidePanelActiveTab(SidePanelTab.TrendOverview),
                ]),
            )
        })
    })
})
