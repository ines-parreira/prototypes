import React from 'react'
import {render} from '@testing-library/react'
import LiveVoice from '../LiveVoice'

jest.mock('pages/stats/voice/components/LiveVoiceFilters', () => () => (
    <div>LiveVoiceFilters</div>
))
jest.mock(
    'pages/stats/StatsPage',
    () =>
        ({children}: {children: React.ReactNode}) =>
            <div>{children}</div>
)

describe('LiveVoice', () => {
    const renderComponent = () => render(<LiveVoice />)

    it('should render all sections', () => {
        const {getByText} = renderComponent()
        expect(getByText('LiveVoiceFilters')).toBeInTheDocument()
        expect(getByText('Agents list')).toBeInTheDocument()
    })
})
