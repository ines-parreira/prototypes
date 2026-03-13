import type { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ChatAutomationCard } from './ChatAutomationCard'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Elevation: { Mid: 'mid' },
    Heading: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
    Text: ({ children }: { children: ReactNode }) => <p>{children}</p>,
    ToggleField: ({
        value,
        onChange,
    }: {
        value: boolean
        onChange: (value: boolean) => void
    }) => (
        <input
            type="checkbox"
            aria-label="Start conversations with automation"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
        />
    ),
}))

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
                name: 'Start conversations with automation',
            }),
        ).toBeInTheDocument()
    })

    it('should render the caption', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Decide if customers begin chatting with your automated flows before reaching your team.',
            ),
        ).toBeInTheDocument()
    })

    it('should render checked when controlTicketVolume is true', () => {
        renderComponent({ controlTicketVolume: true })

        expect(
            screen.getByLabelText('Start conversations with automation'),
        ).toBeChecked()
    })

    it('should render unchecked when controlTicketVolume is false', () => {
        renderComponent({ controlTicketVolume: false })

        expect(
            screen.getByLabelText('Start conversations with automation'),
        ).not.toBeChecked()
    })

    it('should call onControlTicketVolumeChange when toggled on', async () => {
        const user = userEvent.setup()
        const onControlTicketVolumeChange = jest.fn()
        renderComponent({
            controlTicketVolume: false,
            onControlTicketVolumeChange,
        })

        await user.click(
            screen.getByLabelText('Start conversations with automation'),
        )

        expect(onControlTicketVolumeChange).toHaveBeenCalledWith(true)
    })

    it('should call onControlTicketVolumeChange when toggled off', async () => {
        const user = userEvent.setup()
        const onControlTicketVolumeChange = jest.fn()
        renderComponent({
            controlTicketVolume: true,
            onControlTicketVolumeChange,
        })

        await user.click(
            screen.getByLabelText('Start conversations with automation'),
        )

        expect(onControlTicketVolumeChange).toHaveBeenCalledWith(false)
    })
})
