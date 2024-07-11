import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {DrillDownTable} from 'pages/stats/DrillDownTable'
import {DrillDownInfoBar} from 'pages/stats/DrillDownInfoBar'

import {RootState, StoreDispatch} from 'state/types'
import {closeDrillDownModal} from 'state/ui/stats/drillDownSlice'
import {assumeMock} from 'utils/testing'
import {TicketDrillDownTableContent} from 'pages/stats/TicketDrillDownTableContent'
import {useEnrichedDrillDownData} from 'hooks/reporting/useDrillDownData'
import {VoiceMetric} from 'state/ui/stats/types'
import {DrillDownModal} from '../DrillDownModal'
import VoiceCallDrillDownTableContent from '../voice/components/VoiceCallTable/VoiceCallDrillDownTableContent'

jest.mock('pages/stats/DrillDownTable')
const DrillDownTableMock = assumeMock(DrillDownTable)
jest.mock('pages/stats/DrillDownInfoBar')
const DrillDownInfobarMock = assumeMock(DrillDownInfoBar)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<DrillDownModal />', () => {
    const title = 'drill down'
    const metricData = {
        title,
    }
    const defaultState = {
        ui: {
            drillDown: {
                isOpen: true,
                metricData,
            },
        },
    } as unknown as RootState
    const componentMock = () => <div />

    beforeEach(() => {
        DrillDownTableMock.mockImplementation(componentMock)
        DrillDownInfobarMock.mockImplementation(componentMock)
    })

    it('should render the drill down modal', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <DrillDownModal />
            </Provider>
        )

        expect(screen.getByText(title)).toBeInTheDocument()
    })

    it('should render the DrillDownTable and DrillDownInfobar with metricData', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <DrillDownModal />
            </Provider>
        )

        expect(DrillDownTableMock).toHaveBeenCalledWith(
            {
                metricData,
                useDataHook: useEnrichedDrillDownData,
                TableContent: TicketDrillDownTableContent,
            },
            {}
        )
        expect(DrillDownInfobarMock).toHaveBeenCalledWith(
            {
                metricData,
                useDataHook: useEnrichedDrillDownData,
            },
            {}
        )
        expect(screen.getByText(title)).toBeInTheDocument()
    })

    it.each([[VoiceMetric.AverageWaitTime], [VoiceMetric.AverageTalkTime]])(
        'should render voice calls drill down table content for metric %s',
        (metric) => {
            const state = {
                ui: {
                    drillDown: {
                        isOpen: true,
                        metricData: {
                            title: 'voice',
                            metricName: metric,
                        },
                    },
                },
            } as unknown as RootState

            render(
                <Provider store={mockStore(state)}>
                    <DrillDownModal />
                </Provider>
            )

            expect(DrillDownTableMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    metricData: state.ui.drillDown.metricData,
                    TableContent: VoiceCallDrillDownTableContent,
                }),
                {}
            )
            expect(screen.getByText('voice')).toBeInTheDocument()
        }
    )

    it('should close the modal', async () => {
        const store = mockStore(defaultState)
        render(
            <Provider store={store}>
                <DrillDownModal />
            </Provider>
        )

        fireEvent.click(screen.getByText('close'))

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(closeDrillDownModal())
        })
    })
})
