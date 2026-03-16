import type { ReactNode } from 'react'

import { FormField } from '@repo/forms'
import { assumeMock, renderHook } from '@repo/testing'
import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useFormContext } from 'react-hook-form'

import { mockEnqueueStep } from '@gorgias/helpdesk-mocks'
import type { PhoneIntegration } from '@gorgias/helpdesk-queries'
import type { CallRoutingFlow } from '@gorgias/helpdesk-types'
import type { ValidationError } from '@gorgias/helpdesk-validators'
import { validateCallRoutingFlow } from '@gorgias/helpdesk-validators'

import useAppSelector from 'hooks/useAppSelector'
import InputField from 'pages/common/forms/input/InputField'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'

import { VoiceFlowNodeType } from '../constants'
import { useVoiceFlowForm } from '../utils/useVoiceFlowForm'
import VoiceFlowForm from '../VoiceFlowForm'

jest.mock('@gorgias/helpdesk-validators', () => ({
    validateCallRoutingFlow: jest.fn(),
}))

// eslint-disable-next-line no-unused-vars
const mockFormUnsavedChangesPrompt = jest.fn((_args: any) => (
    <div>FormUnsavedChangesPrompt</div>
))

jest.mock('../../VoiceFormSubmitButton', () => ({ children }: any) => (
    <button type="submit">{children}</button>
))
jest.mock('pages/common/components/FormUnsavedChangesPrompt', () => {
    const { forwardRef } = jest.requireActual('react')

    return {
        __esModule: true,
        default: forwardRef((props: any) =>
            mockFormUnsavedChangesPrompt(props as any),
        ),
    }
})

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))
jest.mock('@gorgias/realtime')
jest.mock('hooks/useAppSelector')
const mockUseAppSelector = assumeMock(useAppSelector)

const mockValidateCallRoutingFlow = assumeMock(validateCallRoutingFlow)

const mockIntegration: PhoneIntegration = {
    id: 123,
    name: 'Test Phone Integration',
    type: 'phone',
    meta: {
        preferences: {
            record_inbound_calls: false,
        },
    },
} as PhoneIntegration
const integrationWithRecording = {
    ...mockIntegration,
    meta: {
        preferences: {
            record_inbound_calls: true,
        },
    },
} as PhoneIntegration

const defaultFlowValues: CallRoutingFlow = {
    first_step_id: 'start',
    steps: {
        'play-message': {
            id: 'play-message',
            step_type: VoiceFlowNodeType.PlayMessage,
            name: 'Play Message',
            message: {
                voice_message_type: 'text_to_speech',
                text_to_speech_content: 'Hello, this is a test message.',
            },
            next_step_id: null,
        },
    },
}

const mockOnSubmit = jest.fn()
jest.mock('../utils/useVoiceFlowForm')
assumeMock(useVoiceFlowForm).mockReturnValue({
    getDefaultValues: () => defaultFlowValues,
    onSubmit: mockOnSubmit,
})

const mockNotify = {
    warning: jest.fn(),
}
jest.mock('hooks/useNotify', () => ({
    useNotify: () => mockNotify,
}))

const wrapper = ({
    children,
    integration = mockIntegration,
}: {
    children?: ReactNode
    integration?: PhoneIntegration
}) => (
    <VoiceFlowForm integration={integration}>
        {children}
        <div>Flow Form Content</div>
        <FormField
            label="First Step ID"
            name="first_step_id"
            field={InputField}
            data-testid="first-step-id"
        />
        <FormField
            label="Play Message Content"
            name="steps.play-message.message.text_to_speech_content"
            data-testid="play-message-content"
            field={InputField}
        />
        <FormField
            label="Steps"
            name="steps"
            data-testid="steps-field"
            field={InputField}
        />
    </VoiceFlowForm>
)

describe('VoiceFlowForm', () => {
    const renderComponent = (integration = mockIntegration) =>
        render(wrapper({ integration, children: <div /> }))

    beforeEach(() => {
        mockValidateCallRoutingFlow.mockReturnValue({
            isValid: true,
            data: defaultFlowValues,
            errors: [],
        })
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getCurrentAccountId) return '1'
            if (selector === getCurrentUserId) return '1'
            return null
        })
    })

    it('should render the form content', () => {
        renderComponent()
        expect(screen.getByText('Flow Form Content')).toBeInTheDocument()
    })

    it('should render the save button', () => {
        renderComponent()
        expect(
            screen.getByRole('button', { name: /save changes/i }),
        ).toBeInTheDocument()
    })

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useFormContext<CallRoutingFlow>(), {
            wrapper,
        })

        expect(result.current.getValues()).toEqual(defaultFlowValues)
    })

    it('should call onSubmit when form is submitted', async () => {
        const user = userEvent.setup()
        renderComponent()

        const submitButton = screen.getByRole('button', {
            name: /save changes/i,
        })
        act(() => {
            user.click(submitButton)
        })

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalled()
        })
    })

    it('should show validation errors when form is invalid', async () => {
        const validationErrors = [
            {
                path: 'first_step_id',
                message: 'First step id is required',
            } as ValidationError,
        ]
        mockValidateCallRoutingFlow.mockReturnValue({
            isValid: false,
            data: undefined,
            errors: validationErrors,
        })
        const user = userEvent.setup()

        renderComponent()

        // Clear the first step ID field to trigger validation
        const firstStepIdField = screen.getByTestId('first-step-id')

        const submitButton = screen.getByRole('button', {
            name: /save changes/i,
        })
        act(() => {
            user.clear(firstStepIdField)
            user.click(submitButton)
        })

        await waitFor(() => {
            expect(
                screen.getByText('First step id is required'),
            ).toBeInTheDocument()
        })
    })

    it('should call notifyWarning when record_inbound_calls is enabled and no PlayMessage step exists', () => {
        const enqueueStep = mockEnqueueStep()
        const flowWithoutPlayMessage: CallRoutingFlow = {
            first_step_id: enqueueStep.id,
            steps: {
                [enqueueStep.id]: enqueueStep,
            },
        }

        render(
            <VoiceFlowForm
                integration={integrationWithRecording}
                defaultValues={flowWithoutPlayMessage}
            >
                <div>Flow Form Content</div>
            </VoiceFlowForm>,
        )

        expect(mockNotify.warning).toHaveBeenCalledWith(
            'Call recording is enabled for inbound calls. To ensure transparency, consider adding a recording notification to your welcome message.',
        )
    })

    it('should not call notifyWarning when record_inbound_calls is disabled', () => {
        const enqueueStep = mockEnqueueStep()
        const flowWithoutPlayMessage: CallRoutingFlow = {
            first_step_id: enqueueStep.id,
            steps: {
                [enqueueStep.id]: enqueueStep,
            },
        }

        render(
            <VoiceFlowForm
                integration={
                    mockIntegration /* record_inbound_calls is false here */
                }
                defaultValues={flowWithoutPlayMessage}
            >
                <div>Flow Form Content</div>
            </VoiceFlowForm>,
        )

        expect(mockNotify.warning).not.toHaveBeenCalled()
    })

    it('should not call notifyWarning when PlayMessage step exists even with recording enabled', () => {
        render(
            <VoiceFlowForm
                integration={integrationWithRecording}
                defaultValues={defaultFlowValues}
            >
                <div>Flow Form Content</div>
            </VoiceFlowForm>,
        )

        expect(mockNotify.warning).not.toHaveBeenCalled()
    })

    it('should call notifyWarning when no steps exist even with recording enabled', () => {
        render(
            <VoiceFlowForm integration={integrationWithRecording}>
                <div>Flow Form Content</div>
            </VoiceFlowForm>,
        )

        expect(mockNotify.warning).toHaveBeenCalled()
    })

    it('should handle unexpected errors during validation', async () => {
        const unexpectedError = new Error('Unexpected validation error')
        mockValidateCallRoutingFlow.mockImplementation(() => {
            throw unexpectedError
        })

        const user = userEvent.setup()

        renderComponent()

        const submitButton = screen.getByRole('button', {
            name: /save changes/i,
        })

        await act(async () => {
            await user.click(submitButton)
        })

        await waitFor(() => {
            expect(
                screen.getByText('An unexpected error occurred'),
            ).toBeInTheDocument()
        })

        expect(mockOnSubmit).not.toHaveBeenCalled()
    })
})
