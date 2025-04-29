import { fireEvent, render, screen } from '@testing-library/react'

import VoiceQueueSelectFieldEmpty from '../VoiceQueueSelectFieldEmpty'

describe('VoiceQueueSelectFieldEmpty', () => {
    const renderComponent = (props = {}) => {
        const defaultProps = {
            onAddClick: jest.fn(),
        }

        return render(
            <VoiceQueueSelectFieldEmpty {...defaultProps} {...props} />,
        )
    }

    it('renders the component with correct text', () => {
        renderComponent()

        expect(screen.getByText('No call queues yet?')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Queues route calls to the right team for faster responses. We apply default settings to get you started, which you can customize anytime.',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Create New Call Queue')).toBeInTheDocument()
    })

    it('calls onAddClick when the button is clicked', () => {
        const onAddClick = jest.fn()
        renderComponent({ onAddClick })

        const button = screen.getByText('Create New Call Queue')
        expect(button).toBeInTheDocument()
        expect(button).toBeAriaEnabled()

        fireEvent.click(button)
        expect(onAddClick).toHaveBeenCalledTimes(1)
    })
})
