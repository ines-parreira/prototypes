import React from 'react'
import {render} from '@testing-library/react'
import * as apiQueries from '@gorgias/api-queries'
import {assumeMock} from 'utils/testing'
import LiveVoice from '../LiveVoice'

jest.mock('@gorgias/api-queries')
jest.mock(
    'pages/stats/voice/components/LiveVoice/LiveVoiceFilters',
    () => () => <div>LiveVoiceFilters</div>
)
jest.mock(
    'pages/stats/voice/components/LiveVoice/LiveVoiceMetrics',
    () => () => <div>LiveVoiceMetrics</div>
)
jest.mock(
    'pages/stats/voice/components/LiveVoice/LiveVoiceAgentsSection',
    () => () => <div>LiveVoiceAgentsSection</div>
)
jest.mock(
    'pages/stats/voice/components/LiveVoice/LiveVoiceCallTable',
    () => () => <div>LiveVoiceCallTable</div>
)
jest.mock(
    'pages/stats/StatsPage',
    () =>
        ({children}: {children: React.ReactNode}) =>
            <div>{children}</div>
)

const useListLiveCallQueueVoiceCallsMock = assumeMock(
    apiQueries.useListLiveCallQueueVoiceCalls
)

describe('LiveVoice', () => {
    const renderComponent = () => render(<LiveVoice />)

    beforeEach(() => {
        useListLiveCallQueueVoiceCallsMock.mockReturnValue({
            data: {data: []},
            isLoading: false,
        } as any)
    })

    it('should render all sections', () => {
        const {getByText} = renderComponent()
        expect(getByText('LiveVoiceFilters')).toBeInTheDocument()
        expect(getByText('LiveVoiceMetrics')).toBeInTheDocument()
        expect(getByText('LiveVoiceAgentsSection')).toBeInTheDocument()
        expect(getByText('LiveVoiceCallTable')).toBeInTheDocument()
    })
})
