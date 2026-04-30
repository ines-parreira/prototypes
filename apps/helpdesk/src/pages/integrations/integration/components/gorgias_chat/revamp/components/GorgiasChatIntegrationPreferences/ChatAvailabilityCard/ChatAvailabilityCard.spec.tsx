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
    Card: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Elevation: { Mid: 'mid' },
    Heading: ({ children }: { children?: ReactNode }) => <h2>{children}</h2>,
    Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
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

    describe('default (non-AI agent)', () => {
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
                    'Shoppers can only send live chat messages when an agent is available in Gorgias.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Shoppers can always send live chat messages during business hours.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Shoppers can only leave messages through the offline form.',
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

            expect(onChange).toHaveBeenCalledWith(
                GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
            )
        })

        it('should not render the AI Agent footer note', () => {
            renderComponent()

            expect(
                screen.queryByText(/AI Agent is always active in chat/),
            ).not.toBeInTheDocument()
        })
    })

    describe('AI agent enabled', () => {
        const renderAiAgent = (props = {}) => {
            return renderComponent({ isAiAgentEnabled: true, ...props })
        }

        it('should render the handover heading', () => {
            renderAiAgent()

            expect(
                screen.getByRole('heading', {
                    name: 'When to hand over by email',
                }),
            ).toBeInTheDocument()
        })

        it('should render the handover description', () => {
            renderAiAgent()

            expect(
                screen.getByText(
                    /Choose when the AI Agent hands over by email\./,
                ),
            ).toBeInTheDocument()
        })

        it('should render all three handover options', () => {
            renderAiAgent()

            expect(
                screen.getByLabelText(/Outside business hours only/),
            ).toBeInTheDocument()
            expect(
                screen.getByLabelText(/When no agent is live on chat/),
            ).toBeInTheDocument()
            expect(
                screen.getByLabelText(/Always transfer to email/),
            ).toBeInTheDocument()
        })

        it('should render captions for each option', () => {
            renderAiAgent()

            expect(
                screen.getByText(
                    /During business hours, conversations stay in chat\./,
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /If anyone from your team is online, the conversation stays in chat\./,
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    "Every handover goes to email, regardless of business hours or who's online.",
                ),
            ).toBeInTheDocument()
        })

        it('should render the AI Agent footer note', () => {
            renderAiAgent()

            expect(
                screen.getByText(
                    /The AI Agent always answers in chat\. This setting only controls what happens when it hands over to your team\./,
                ),
            ).toBeInTheDocument()
        })

        it('should reflect the current liveChatAvailability value in the radio group', () => {
            renderAiAgent({
                liveChatAvailability:
                    GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
            })

            expect(screen.getByRole('radiogroup')).toHaveAttribute(
                'data-value',
                GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
            )
        })

        it('should call onChange with the correct value when "Outside business hours only" is selected', async () => {
            const user = userEvent.setup()
            const onChange = jest.fn()
            renderAiAgent({ onChange })

            await user.click(
                screen.getByLabelText(/Outside business hours only/),
            )

            expect(onChange).toHaveBeenCalledWith(
                GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
            )
        })

        it('should call onChange with the correct value when "When no agent is live on chat" is selected', async () => {
            const user = userEvent.setup()
            const onChange = jest.fn()
            renderAiAgent({ onChange })

            await user.click(
                screen.getByLabelText(/When no agent is live on chat/),
            )

            expect(onChange).toHaveBeenCalledWith(
                GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
            )
        })

        it('should call onChange with the correct value when "Always transfer to email" is selected', async () => {
            const user = userEvent.setup()
            const onChange = jest.fn()
            renderAiAgent({ onChange })

            await user.click(screen.getByLabelText(/Always transfer to email/))

            expect(onChange).toHaveBeenCalledWith(
                GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
            )
        })
    })
})
