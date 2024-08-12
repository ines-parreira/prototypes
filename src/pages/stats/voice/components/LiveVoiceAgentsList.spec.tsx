import React from 'react'
import {render, screen} from '@testing-library/react'
import LiveVoiceAgentsList from './LiveVoiceAgentsList'

describe('LiveVoiceAgentsList', () => {
    const renderComponent = () => render(<LiveVoiceAgentsList />)

    it('should render the title and category labels', () => {
        renderComponent()

        expect(screen.getByText('Agents')).toBeInTheDocument()
        expect(screen.getByText('Busy')).toBeInTheDocument()
        expect(screen.getByText('Available')).toBeInTheDocument()
        expect(screen.getByText('Unavailable')).toBeInTheDocument()
    })
})
