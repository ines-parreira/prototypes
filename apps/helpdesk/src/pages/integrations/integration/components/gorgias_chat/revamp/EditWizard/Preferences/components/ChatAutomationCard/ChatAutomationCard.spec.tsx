import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ChatAutomationCard } from './ChatAutomationCard'

const TOGGLE_LABEL = 'Remove “Send us a message” button'

describe('ChatAutomationCard', () => {
    const defaultProps = {
        controlTicketVolume: false,
        onControlTicketVolumeChange: jest.fn(),
    }

    const renderComponent = (props = {}) => {
        return render(<ChatAutomationCard {...defaultProps} {...props} />)
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the heading', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', {
                name: 'Require automated interaction',
            }),
        ).toBeInTheDocument()
    })

    it('should render the description', () => {
        renderComponent()

        expect(screen.getByText(/Hide “Send us a message”/)).toBeInTheDocument()
    })

    it('should render checked when controlTicketVolume is true', () => {
        renderComponent({ controlTicketVolume: true })

        expect(screen.getByLabelText(TOGGLE_LABEL)).toBeChecked()
    })

    it('should render unchecked when controlTicketVolume is false', () => {
        renderComponent({ controlTicketVolume: false })

        expect(screen.getByLabelText(TOGGLE_LABEL)).not.toBeChecked()
    })

    it('should call onControlTicketVolumeChange when toggled on', async () => {
        const user = userEvent.setup()
        const onControlTicketVolumeChange = jest.fn()
        renderComponent({
            controlTicketVolume: false,
            onControlTicketVolumeChange,
        })

        await user.click(screen.getByLabelText(TOGGLE_LABEL))

        expect(onControlTicketVolumeChange).toHaveBeenCalledWith(true)
    })

    it('should call onControlTicketVolumeChange when toggled off', async () => {
        const user = userEvent.setup()
        const onControlTicketVolumeChange = jest.fn()
        renderComponent({
            controlTicketVolume: true,
            onControlTicketVolumeChange,
        })

        await user.click(screen.getByLabelText(TOGGLE_LABEL))

        expect(onControlTicketVolumeChange).toHaveBeenCalledWith(false)
    })
})
