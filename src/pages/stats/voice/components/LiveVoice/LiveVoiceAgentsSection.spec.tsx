import React from 'react'
import {cleanup, render, screen} from '@testing-library/react'
import {useListLiveCallQueueAgents} from '@gorgias/api-queries'
import {assumeMock} from 'utils/testing'

import LiveVoiceAgentsSection from './LiveVoiceAgentsSection'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div>Skeleton</div>
))
jest.mock('@gorgias/api-queries')

const useListLiveCallQueueAgentsMock = assumeMock(useListLiveCallQueueAgents)

jest.mock(
    'pages/stats/voice/components/LiveVoice/LiveVoiceAgentsList',
    () => () => <div>LiveVoiceAgentsList</div>
)

describe('LiveVoiceAgentsSection', () => {
    const renderComponent = () => render(<LiveVoiceAgentsSection />)

    afterEach(cleanup)

    it('should display loading state', () => {
        useListLiveCallQueueAgentsMock.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any)

        renderComponent()

        expect(screen.getAllByText('Skeleton').length).toBeGreaterThan(0)
        expect(
            screen.queryByText('LiveVoiceAgentsList')
        ).not.toBeInTheDocument()
    })

    it('should display agents list', () => {
        useListLiveCallQueueAgentsMock.mockReturnValue({
            data: {data: {data: [{id: 1, name: 'Agent 1'}]}},
            isLoading: false,
        } as any)

        renderComponent()

        expect(screen.getByText('LiveVoiceAgentsList')).toBeInTheDocument()
    })

    it('should display no data available', () => {
        useListLiveCallQueueAgentsMock.mockReturnValue({
            data: {data: {data: []}},
            isLoading: false,
        } as any)

        renderComponent()

        expect(screen.getByText('No data available')).toBeInTheDocument()
    })
})
