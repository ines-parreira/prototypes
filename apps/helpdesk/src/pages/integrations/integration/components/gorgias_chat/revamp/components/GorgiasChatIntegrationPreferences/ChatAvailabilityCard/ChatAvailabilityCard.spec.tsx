import type { ChangeEvent, ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
    GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
    GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
} from 'config/integrations/gorgias_chat'

import { ChatAvailabilityCard } from './ChatAvailabilityCard'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Elevation: { Mid: 'mid' },
    Heading: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
    Text: ({ children }: { children: ReactNode }) => <span>{children}</span>,
    RadioGroup: ({
        children,
        value,
        onChange,
    }: {
        children: ReactNode
        value: string
        onChange: (value: string) => void
    }) => (
        <div
            role="radiogroup"
            data-value={value}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.type === 'radio') onChange(e.target.value)
            }}
        >
            {children}
        </div>
    ),
    Radio: ({
        value,
        label,
        caption,
    }: {
        value: string
        label: string
        caption?: string
    }) => (
        <label>
            <input type="radio" value={value} onChange={() => {}} />
            {label}
            {caption && <span>{caption}</span>}
        </label>
    ),
}))

describe('ChatAvailabilityCard', () => {
    const defaultProps = {
        liveChatAvailability:
            GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
        onChange: jest.fn(),
    }

    const renderComponent = (props = {}) => {
        return render(<ChatAvailabilityCard {...defaultProps} {...props} />)
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the section heading', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', { name: 'Chat availability' }),
        ).toBeInTheDocument()
    })

    it('should render the section description', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Control when shoppers can start a live chat and what happens outside business hours.',
            ),
        ).toBeInTheDocument()
    })

    it('should render all three availability options', () => {
        renderComponent()

        expect(
            screen.getByLabelText(/Live when agents are available/),
        ).toBeInTheDocument()
        expect(
            screen.getByLabelText(/Always live during business hours/),
        ).toBeInTheDocument()
        expect(
            screen.getByLabelText(/Offline \(capture messages only\)/),
        ).toBeInTheDocument()
    })

    it('should render captions for each option', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Customers can only send live chat messages when an agent is available in Gorgias.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Customers can always send live chat messages during business hours.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Customers can only send messages using the offline capture.',
            ),
        ).toBeInTheDocument()
    })

    it('should reflect the current liveChatAvailability value in the radio group', () => {
        renderComponent({
            liveChatAvailability:
                GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
        })

        expect(screen.getByRole('radiogroup')).toHaveAttribute(
            'data-value',
            GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
        )
    })

    it('should call onChange with the correct value when an option is selected', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        renderComponent({ onChange })

        await user.click(
            screen.getByLabelText(/Always live during business hours/),
        )

        expect(onChange).toHaveBeenCalledWith(
            GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
        )
    })

    it('should call onChange with offline value when offline option is selected', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        renderComponent({ onChange })

        await user.click(
            screen.getByLabelText(/Offline \(capture messages only\)/),
        )

        expect(onChange).toHaveBeenCalledWith(GORGIAS_CHAT_LIVE_CHAT_OFFLINE)
    })
})
