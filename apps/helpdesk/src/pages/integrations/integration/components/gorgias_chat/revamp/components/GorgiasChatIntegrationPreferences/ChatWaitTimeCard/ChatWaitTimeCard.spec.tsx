import type { ChangeEvent, ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
} from 'config/integrations/gorgias_chat'

import { ChatWaitTimeCard } from './ChatWaitTimeCard'

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
            aria-label="Share wait time with customers"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
        />
    ),
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
        isDisabled,
    }: {
        value: string
        label: string
        caption?: string
        isDisabled?: boolean
    }) => (
        <label>
            <input
                type="radio"
                value={value}
                disabled={isDisabled}
                onChange={() => {}}
            />
            {label}
            {caption && <span>{caption}</span>}
        </label>
    ),
}))

describe('ChatWaitTimeCard', () => {
    const defaultProps = {
        autoResponderEnabled: true,
        autoResponderReply: GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
        onAutoResponderEnabledChange: jest.fn(),
        onAutoResponderReplyChange: jest.fn(),
    }

    const renderComponent = (props = {}) => {
        return render(<ChatWaitTimeCard {...defaultProps} {...props} />)
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the heading', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', {
                name: 'Share wait time with customers',
            }),
        ).toBeInTheDocument()
    })

    it('should render the caption', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Let customers know when to expect a reply while waiting for your team.',
            ),
        ).toBeInTheDocument()
    })

    it('should render three radio options', () => {
        renderComponent()

        expect(
            screen.getByLabelText(/Dynamic wait time \(recommended\)/),
        ).toBeInTheDocument()
        expect(screen.getByLabelText('In a few minutes')).toBeInTheDocument()
        expect(screen.getByLabelText('In a few hours')).toBeInTheDocument()
        expect(
            screen.queryByLabelText('Do not share wait time'),
        ).not.toBeInTheDocument()
    })

    it('should render the dynamic wait time caption', () => {
        renderComponent()

        expect(
            screen.getByText(
                "Calculated based on your team's recent live chat response times.",
            ),
        ).toBeInTheDocument()
    })

    describe('toggle state', () => {
        it('should render checked when autoResponderEnabled is true', () => {
            renderComponent({ autoResponderEnabled: true })

            expect(
                screen.getByLabelText('Share wait time with customers'),
            ).toBeChecked()
        })

        it('should render unchecked when autoResponderEnabled is false', () => {
            renderComponent({ autoResponderEnabled: false })

            expect(
                screen.getByLabelText('Share wait time with customers'),
            ).not.toBeChecked()
        })

        it('should call onAutoResponderEnabledChange when toggled on', async () => {
            const user = userEvent.setup()
            const onAutoResponderEnabledChange = jest.fn()
            renderComponent({
                autoResponderEnabled: false,
                onAutoResponderEnabledChange,
            })

            await user.click(
                screen.getByLabelText('Share wait time with customers'),
            )

            expect(onAutoResponderEnabledChange).toHaveBeenCalledWith(true)
        })

        it('should call onAutoResponderEnabledChange when toggled off', async () => {
            const user = userEvent.setup()
            const onAutoResponderEnabledChange = jest.fn()
            renderComponent({
                autoResponderEnabled: true,
                onAutoResponderEnabledChange,
            })

            await user.click(
                screen.getByLabelText('Share wait time with customers'),
            )

            expect(onAutoResponderEnabledChange).toHaveBeenCalledWith(false)
        })
    })

    describe('radio group value', () => {
        it('should reflect autoResponderReply when enabled', () => {
            renderComponent({
                autoResponderEnabled: true,
                autoResponderReply:
                    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
            })

            expect(screen.getByRole('radiogroup')).toHaveAttribute(
                'data-value',
                GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
            )
        })

        it('should reflect autoResponderReply when disabled', () => {
            renderComponent({
                autoResponderEnabled: false,
                autoResponderReply: GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
            })

            expect(screen.getByRole('radiogroup')).toHaveAttribute(
                'data-value',
                GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
            )
        })
    })

    describe('radio options disabled state', () => {
        it('should disable all radio options when autoResponderEnabled is false', () => {
            renderComponent({ autoResponderEnabled: false })

            expect(
                screen.getByLabelText(/Dynamic wait time \(recommended\)/),
            ).toBeDisabled()
            expect(screen.getByLabelText('In a few minutes')).toBeDisabled()
            expect(screen.getByLabelText('In a few hours')).toBeDisabled()
        })

        it('should enable all radio options when autoResponderEnabled is true', () => {
            renderComponent({ autoResponderEnabled: true })

            expect(
                screen.getByLabelText(/Dynamic wait time \(recommended\)/),
            ).not.toBeDisabled()
            expect(screen.getByLabelText('In a few minutes')).not.toBeDisabled()
            expect(screen.getByLabelText('In a few hours')).not.toBeDisabled()
        })
    })

    describe('radio onChange callbacks', () => {
        it('should call onAutoResponderReplyChange when dynamic is selected', async () => {
            const user = userEvent.setup()
            const onAutoResponderReplyChange = jest.fn()
            renderComponent({
                autoResponderEnabled: true,
                autoResponderReply: GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
                onAutoResponderReplyChange,
            })

            await user.click(
                screen.getByLabelText(/Dynamic wait time \(recommended\)/),
            )

            expect(onAutoResponderReplyChange).toHaveBeenCalledWith(
                GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
            )
        })

        it('should call onAutoResponderReplyChange when in-minutes is selected', async () => {
            const user = userEvent.setup()
            const onAutoResponderReplyChange = jest.fn()
            renderComponent({
                autoResponderEnabled: true,
                onAutoResponderReplyChange,
            })

            await user.click(screen.getByLabelText('In a few minutes'))

            expect(onAutoResponderReplyChange).toHaveBeenCalledWith(
                GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
            )
        })

        it('should call onAutoResponderReplyChange when in-hours is selected', async () => {
            const user = userEvent.setup()
            const onAutoResponderReplyChange = jest.fn()
            renderComponent({
                autoResponderEnabled: true,
                onAutoResponderReplyChange,
            })

            await user.click(screen.getByLabelText('In a few hours'))

            expect(onAutoResponderReplyChange).toHaveBeenCalledWith(
                GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
            )
        })
    })
})
