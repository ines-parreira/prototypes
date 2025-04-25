import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    VoCSidePanel,
    VoCSidePanelTabs,
} from 'pages/stats/voice-of-customer/side-panel/VoCSidePanel'
import {
    getSidePanelActiveTab,
    getSidePanelIsOpen,
    setSidePanelActiveTab,
    SidePanelTab,
} from 'state/ui/stats/sidePanelSlice'
import { assumeMock } from 'utils/testing'

const dispatchMock = jest.fn()

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)
jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)

describe('VoCSidePanel', () => {
    const mockStore = configureMockStore([thunk])({
        ui: {
            stats: {
                sidePanel: {
                    isOpen: true,
                    activeTab: SidePanelTab.insights,
                },
            },
        },
    })

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getSidePanelIsOpen) {
                return true
            }
            if (selector === getSidePanelActiveTab) {
                return SidePanelTab.insights
            }
            return null
        })
    })

    it('renders with default props', () => {
        useAppSelectorMock.mockReturnValueOnce(false)
        useAppSelectorMock.mockReturnValueOnce(SidePanelTab.insights)

        render(
            <Provider store={mockStore}>
                <VoCSidePanel />
            </Provider>,
        )

        expect(
            screen.getByText(VoCSidePanelTabs.insights.label),
        ).toBeInTheDocument()
        expect(
            screen.getByText(VoCSidePanelTabs.trendOverview.label),
        ).toBeInTheDocument()
        expect(screen.getByText('Insights_Content')).toBeInTheDocument()
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders with custom active tab', () => {
        useAppSelectorMock.mockReturnValue(SidePanelTab.trendOverview)

        render(<VoCSidePanel />)

        expect(screen.getByText('Trend_Overview_Content')).toBeInTheDocument()
    })

    it('handles close button click', () => {
        render(<VoCSidePanel />)
        const closeButton = screen.getByText(/keyboard_tab/)

        fireEvent.click(closeButton)

        expect(useAppDispatchMock).toHaveBeenCalled()
    })

    it('handles backdrop click', () => {
        render(<VoCSidePanel />)
        const backdrop = document.querySelector('.backdrop')

        if (backdrop) {
            fireEvent.click(backdrop)
        }

        expect(useAppDispatchMock).toHaveBeenCalled()
    })

    it('dispatches setSidePanelActiveTab when tab is changed', () => {
        render(<VoCSidePanel />)

        const trendOverviewTab = screen.getByText('Trend Overview')
        fireEvent.focus(trendOverviewTab)

        expect(dispatchMock).toHaveBeenCalledWith(
            setSidePanelActiveTab(SidePanelTab.trendOverview),
        )
    })
})
