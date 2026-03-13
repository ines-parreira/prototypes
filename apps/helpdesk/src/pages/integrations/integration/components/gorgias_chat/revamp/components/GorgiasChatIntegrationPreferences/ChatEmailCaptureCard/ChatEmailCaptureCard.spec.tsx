import type { ChangeEvent, ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL,
} from 'config/integrations/gorgias_chat'

import { ChatEmailCaptureCard } from './ChatEmailCaptureCard'

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
            aria-label="Collect customer emails"
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

describe('ChatEmailCaptureCard', () => {
    const defaultProps = {
        emailCaptureEnabled: true,
        emailCaptureEnforcement: GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL,
        onEmailCaptureEnabledChange: jest.fn(),
        onEmailCaptureEnforcementChange: jest.fn(),
    }

    const renderComponent = (props = {}) => {
        return render(<ChatEmailCaptureCard {...defaultProps} {...props} />)
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the heading', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', { name: 'Collect customer emails' }),
        ).toBeInTheDocument()
    })

    it('should render the caption', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Grow your email list and send follow-up messages.',
            ),
        ).toBeInTheDocument()
    })

    it('should render both radio options', () => {
        renderComponent()

        expect(screen.getByLabelText(/Optional/)).toBeInTheDocument()
        expect(screen.getByLabelText(/Required/)).toBeInTheDocument()
    })

    it('should render the required caption', () => {
        renderComponent()

        expect(
            screen.getByText('Reduces incoming conversations by ~70%'),
        ).toBeInTheDocument()
    })

    describe('toggle state', () => {
        it('should render checked when emailCaptureEnabled is true', () => {
            renderComponent({ emailCaptureEnabled: true })

            expect(
                screen.getByLabelText('Collect customer emails'),
            ).toBeChecked()
        })

        it('should render unchecked when emailCaptureEnabled is false', () => {
            renderComponent({ emailCaptureEnabled: false })

            expect(
                screen.getByLabelText('Collect customer emails'),
            ).not.toBeChecked()
        })

        it('should call onEmailCaptureEnabledChange when toggled on', async () => {
            const user = userEvent.setup()
            const onEmailCaptureEnabledChange = jest.fn()
            renderComponent({
                emailCaptureEnabled: false,
                onEmailCaptureEnabledChange,
            })

            await user.click(screen.getByLabelText('Collect customer emails'))

            expect(onEmailCaptureEnabledChange).toHaveBeenCalledWith(true)
        })

        it('should call onEmailCaptureEnabledChange when toggled off', async () => {
            const user = userEvent.setup()
            const onEmailCaptureEnabledChange = jest.fn()
            renderComponent({
                emailCaptureEnabled: true,
                onEmailCaptureEnabledChange,
            })

            await user.click(screen.getByLabelText('Collect customer emails'))

            expect(onEmailCaptureEnabledChange).toHaveBeenCalledWith(false)
        })
    })

    describe('radio group value', () => {
        it('should reflect emailCaptureEnforcement value', () => {
            renderComponent({
                emailCaptureEnforcement:
                    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
            })

            expect(screen.getByRole('radiogroup')).toHaveAttribute(
                'data-value',
                GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
            )
        })
    })

    describe('radio options disabled state', () => {
        it('should disable radio options when emailCaptureEnabled is false', () => {
            renderComponent({ emailCaptureEnabled: false })

            expect(screen.getByLabelText(/Optional/)).toBeDisabled()
            expect(screen.getByLabelText(/Required/)).toBeDisabled()
        })

        it('should enable radio options when emailCaptureEnabled is true', () => {
            renderComponent({ emailCaptureEnabled: true })

            expect(screen.getByLabelText(/Optional/)).not.toBeDisabled()
            expect(screen.getByLabelText(/Required/)).not.toBeDisabled()
        })
    })

    describe('radio onChange', () => {
        it('should call onEmailCaptureEnforcementChange with optional value', async () => {
            const user = userEvent.setup()
            const onEmailCaptureEnforcementChange = jest.fn()
            renderComponent({
                emailCaptureEnforcement:
                    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
                onEmailCaptureEnforcementChange,
            })

            await user.click(screen.getByLabelText(/Optional/))

            expect(onEmailCaptureEnforcementChange).toHaveBeenCalledWith(
                GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL,
            )
        })

        it('should call onEmailCaptureEnforcementChange with required value', async () => {
            const user = userEvent.setup()
            const onEmailCaptureEnforcementChange = jest.fn()
            renderComponent({ onEmailCaptureEnforcementChange })

            await user.click(screen.getByLabelText(/Required/))

            expect(onEmailCaptureEnforcementChange).toHaveBeenCalledWith(
                GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
            )
        })
    })
})
