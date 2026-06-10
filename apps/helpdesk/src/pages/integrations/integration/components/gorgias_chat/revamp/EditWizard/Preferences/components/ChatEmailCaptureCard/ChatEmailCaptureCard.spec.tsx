import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL,
} from 'config/integrations/gorgias_chat'

import { ChatEmailCaptureCard } from './ChatEmailCaptureCard'

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
            screen.getByRole('heading', { name: 'Collect shopper emails' }),
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
            screen.getByText('Reduces incoming conversations by about 70%'),
        ).toBeInTheDocument()
    })

    describe('when isAiAgentEnabled is true', () => {
        it('should render the AI Agent heading', () => {
            renderComponent({ isAiAgentEnabled: true })

            expect(
                screen.getByRole('heading', {
                    name: 'Collect shopper emails at handover',
                }),
            ).toBeInTheDocument()
        })

        it('should render the AI Agent description', () => {
            renderComponent({ isAiAgentEnabled: true })

            expect(
                screen.getByText(
                    'When AI Agent hands over to your team, ask the shopper for their email so your team can follow up.',
                ),
            ).toBeInTheDocument()
        })

        it('should render the AI Agent optional caption', () => {
            renderComponent({ isAiAgentEnabled: true })

            expect(
                screen.getByText(
                    'Email is requested but skippable, a ticket opens in your helpdesk in all cases.',
                ),
            ).toBeInTheDocument()
        })

        it('should render the AI Agent required caption', () => {
            renderComponent({ isAiAgentEnabled: true })

            expect(
                screen.getByText(
                    'Email is required before the conversation can continue. The ticket stays closed until the email is provided.',
                ),
            ).toBeInTheDocument()
        })

        it('should not render the default required caption', () => {
            renderComponent({ isAiAgentEnabled: true })

            expect(
                screen.queryByText(
                    'Reduces incoming conversations by about 70%',
                ),
            ).not.toBeInTheDocument()
        })

        it('should not render the default description', () => {
            renderComponent({ isAiAgentEnabled: true })

            expect(
                screen.queryByText(
                    'Grow your email list and send follow-up messages.',
                ),
            ).not.toBeInTheDocument()
        })
    })

    describe('toggle state', () => {
        it('should render checked when emailCaptureEnabled is true', () => {
            renderComponent({ emailCaptureEnabled: true })

            expect(screen.getByRole('switch')).toBeChecked()
        })

        it('should render unchecked when emailCaptureEnabled is false', () => {
            renderComponent({ emailCaptureEnabled: false })

            expect(screen.getByRole('switch')).not.toBeChecked()
        })

        it('should call onEmailCaptureEnabledChange when toggled on', async () => {
            const user = userEvent.setup()
            const onEmailCaptureEnabledChange = jest.fn()
            renderComponent({
                emailCaptureEnabled: false,
                onEmailCaptureEnabledChange,
            })

            await user.click(screen.getByRole('switch'))

            expect(onEmailCaptureEnabledChange).toHaveBeenCalledWith(true)
        })

        it('should call onEmailCaptureEnabledChange when toggled off', async () => {
            const user = userEvent.setup()
            const onEmailCaptureEnabledChange = jest.fn()
            renderComponent({
                emailCaptureEnabled: true,
                onEmailCaptureEnabledChange,
            })

            await user.click(screen.getByRole('switch'))

            expect(onEmailCaptureEnabledChange).toHaveBeenCalledWith(false)
        })
    })

    describe('radio group value', () => {
        it('should reflect emailCaptureEnforcement value', () => {
            renderComponent({
                emailCaptureEnforcement:
                    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
            })

            expect(
                screen.getByRole('radio', { name: /Required/ }),
            ).toBeChecked()
            expect(
                screen.getByRole('radio', { name: /Optional/ }),
            ).not.toBeChecked()
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
