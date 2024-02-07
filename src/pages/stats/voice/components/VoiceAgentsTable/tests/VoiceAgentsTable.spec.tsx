import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import userEvent from '@testing-library/user-event'
import {act, fireEvent, render, waitFor} from '@testing-library/react'

import {assumeMock} from 'utils/testing'
import {RootState, StoreDispatch} from 'state/types'
import {agents} from 'fixtures/agents'
import {
    getPaginatedAgents,
    getSortedAgents,
    pageSet,
} from 'state/ui/stats/agentPerformanceSlice'

import {VoiceAgentsTable} from '../VoiceAgentsTable'

jest.mock(
    'pages/stats/voice/components/VoiceAgentsTable/AverageTalkTimeCell',
    () =>
        ({agentId}: {agentId: number}) =>
            <div>AverageTalkTimeCell {agentId}</div>
)
jest.mock(
    'pages/stats/voice/components/VoiceAgentsTable/CallsCountCell',
    () =>
        ({agentId}: {agentId: number}) =>
            <div>CallsCountCell {agentId}</div>
)
jest.mock(
    'pages/stats/voice/components/VoiceAgentsTable/TeamAverageTalkTimeCell',
    () => () => <div>TeamAverageTalkTimeCell</div>
)
jest.mock(
    'pages/stats/voice/components/VoiceAgentsTable/TeamAverageCallsCountCell',
    () => () => <div>TeamAverageCallsCountCell</div>
)
jest.mock(
    'state/ui/stats/agentPerformanceSlice',
    () =>
        ({
            ...jest.requireActual('state/ui/stats/agentPerformanceSlice'),
            getSortedAgents: jest.fn(),
            getPaginatedAgents: jest.fn(),
        } as Record<string, any>)
)
jest.mock(
    'state/ui/stats/selectors',
    () =>
        ({
            ...jest.requireActual('state/ui/stats/selectors'),
            getCleanStatsFilters: jest.fn(),
        } as Record<string, any>)
)

const getSortedAgentsMock = assumeMock(getSortedAgents)
const getPaginatedAgentsMock = assumeMock(getPaginatedAgents)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('VoiceCallTable', () => {
    const currentPage = 2
    getSortedAgentsMock.mockReturnValue(agents)
    const paginatedAgents = agents.slice(1)
    getPaginatedAgentsMock.mockReturnValue({
        agents: paginatedAgents,
        currentPage,
        perPage: 1,
    })

    const renderComponent = (store = mockStore({})) => {
        return render(
            <Provider store={store}>
                <VoiceAgentsTable />
            </Provider>
        )
    }

    it('should render table', () => {
        const {getByText, getAllByText} = renderComponent()

        expect(getByText('Agent')).toBeInTheDocument()
        expect(getByText('Total calls')).toBeInTheDocument()
        expect(getByText('Answered')).toBeInTheDocument()
        expect(getByText('Missed')).toBeInTheDocument()
        expect(getByText('Declined')).toBeInTheDocument()
        expect(getByText('Outbound')).toBeInTheDocument()
        expect(getByText('Avg. Talk Time')).toBeInTheDocument()

        expect(getByText('Team average')).toBeInTheDocument()
        expect(getAllByText('TeamAverageCallsCountCell')).toHaveLength(5)
        expect(getByText('TeamAverageTalkTimeCell')).toBeInTheDocument()

        expect(getByText('Bob Smith')).toBeInTheDocument()
        expect(getAllByText('CallsCountCell')).toHaveLength(5)
        expect(getByText('AverageTalkTimeCell')).toBeInTheDocument()

        expect(getByText(currentPage)).toBeInTheDocument()
    })

    it('should handle table scrolling', async () => {
        const {container, getByRole} = renderComponent()

        act(() => {
            const tableRow = container.getElementsByClassName('container')[0]
            fireEvent.scroll(tableRow, {target: {scrollLeft: 50}})
        })

        await waitFor(() => {
            expect(
                getByRole('cell', {
                    name: new RegExp('Bob Smith'),
                })
            ).toHaveClass('withShadow')
        })
    })

    it('should not render Pagination if fewer agents then perPage', () => {
        getPaginatedAgentsMock.mockReturnValue({
            agents,
            currentPage: 1,
            perPage: agents.length + 1,
        })

        const {queryByText} = renderComponent()

        expect(queryByText(currentPage)).not.toBeInTheDocument()
    })

    it('should dispatch pageSet action on page change', () => {
        const store = mockStore({})
        const pageToClick = currentPage - 1
        getPaginatedAgentsMock.mockReturnValue({
            agents,
            currentPage,
            perPage: 1,
        })

        const {getByText} = renderComponent(store)

        act(() => {
            const pageButton = getByText(pageToClick)
            userEvent.click(pageButton)
        })

        expect(store.getActions()).toContainEqual(pageSet(pageToClick))
    })
})
