import React from 'react'
import {render, screen} from '@testing-library/react'
import AIAgentFeedbackBar from '../AIAgentFeedbackBar'

describe('AIAgentFeedbackBar', () => {
    it('renders without crashing', () => {
        render(<AIAgentFeedbackBar />)
    })

    it('displays the correct text', () => {
        render(<AIAgentFeedbackBar />)
        expect(screen.getByText('AIAgentFeedbackBar')).toBeInTheDocument()
    })
})
