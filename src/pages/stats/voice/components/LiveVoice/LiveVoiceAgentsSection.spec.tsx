import React from 'react'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'

import { useListLiveCallQueueAgents } from '@gorgias/api-queries'

import { FilterKey, StatsFiltersWithLogicalOperator } from 'models/stat/types'
import { assumeMock } from 'utils/testing'

import LiveVoiceAgentsSection from './LiveVoiceAgentsSection'

jest.mock('@gorgias/merchant-ui-kit', () => ({
    Skeleton: () => <div>Skeleton</div>,
}))
jest.mock('@gorgias/api-queries')
jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

const useListLiveCallQueueAgentsMock = assumeMock(useListLiveCallQueueAgents)

jest.mock(
    'pages/stats/voice/components/LiveVoice/LiveVoiceAgentsList',
    () => () => <div>LiveVoiceAgentsList</div>,
)

describe('LiveVoiceAgentsSection', () => {
    const renderComponent = (
        props = {
            cleanStatsFilters: {
                [FilterKey.Agents]: { values: [1, 2] },
                [FilterKey.Integrations]: { values: [3, 4] },
            } as StatsFiltersWithLogicalOperator,
        },
    ) => render(<LiveVoiceAgentsSection {...props} />)

    afterEach(cleanup)

    it('should display loading state', () => {
        useListLiveCallQueueAgentsMock.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any)

        renderComponent()

        expect(screen.getAllByText('Skeleton').length).toBeGreaterThan(0)
        expect(
            screen.queryByText('LiveVoiceAgentsList'),
        ).not.toBeInTheDocument()
    })

    it('should display agents list', () => {
        useListLiveCallQueueAgentsMock.mockReturnValue({
            data: { data: { data: [{ id: 1, name: 'Agent 1' }] } },
            isLoading: false,
        } as any)

        renderComponent()

        expect(screen.getByText('LiveVoiceAgentsList')).toBeInTheDocument()
    })

    it('should display no data available', () => {
        const refetch = jest.fn()
        useListLiveCallQueueAgentsMock.mockReturnValue({
            data: { data: { data: [] } },
            isLoading: false,
            refetch,
        } as any)

        renderComponent()

        expect(screen.getByText('No data available')).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
        expect(refetch).toHaveBeenCalled()
    })

    it('should pass correct filters to useListLiveCallQueueAgents', () => {
        renderComponent()
        expect(useListLiveCallQueueAgentsMock).toHaveBeenCalledWith(
            {
                agent_ids: [1, 2],
                integration_ids: [3, 4],
            },
            expect.any(Object),
        )
    })
})
