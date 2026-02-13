import type { ComponentProps } from 'react'

import { Form } from '@repo/forms'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import type { ListIntegrations200 } from '@gorgias/helpdesk-client'
import {
    mockCallRoutingFlow,
    mockListIntegrationsHandler,
    mockSendToSMSStep,
} from '@gorgias/helpdesk-mocks'
import type { SendToSMSStep } from '@gorgias/helpdesk-types'

import { FlowProvider } from 'core/ui/flows'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import type { TextToSpeechContext as TextToSpeechContextType } from '../../../VoiceMessageTTS/TextToSpeechContext'
import TextToSpeechContext from '../../../VoiceMessageTTS/TextToSpeechContext'
import type { VoiceFlowFormValues } from '../../types'
import VoiceFlowProvider from '../../VoiceFlowProvider'
import { SendToSMSNode } from '../SendToSMSNode'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterAll(() => {
    server.close()
})

describe('SendToSMSNode', () => {
    const mockDefaultStep: SendToSMSStep = mockSendToSMSStep({
        id: 'sms-step-1',
        sms_integration_id: 123,
        sms_content: 'Hello, how can I help?',
        confirmation_message: {
            voice_message_type: 'text_to_speech',
            text_to_speech_content:
                'We have sent you an SMS. Please check your phone.',
        } as any,
    })

    const mockFlowData: VoiceFlowFormValues = mockCallRoutingFlow({
        first_step_id: mockDefaultStep.id,
        steps: { [mockDefaultStep.id]: mockDefaultStep },
    })

    beforeEach(() => {
        const mockHandlers = mockListIntegrationsHandler(async () =>
            HttpResponse.json({
                data: [
                    {
                        id: 123,
                        name: 'Cool SMS Integration',
                        meta: {
                            phone_number_id: 1,
                        },
                    },
                    {
                        id: 456,
                        name: 'Voice sales SMS',
                        meta: {
                            phone_number_id: 2,
                        },
                    },
                ],
            } as ListIntegrations200),
        )
        server.use(mockHandlers.handler)
    })

    afterEach(() => {
        server.resetHandlers()
    })

    const renderComponent = (
        step: SendToSMSStep,
        flowData: VoiceFlowFormValues,
    ) => {
        const mockPhoneNumbers = {
            1: {
                id: 1,
                phone_number_friendly: '+1 (555) 123-4567',
            },
        }

        const props = {
            id: step.id,
            data: step,
        } as ComponentProps<typeof SendToSMSNode>

        return renderWithStoreAndQueryClientProvider(
            <FlowProvider>
                <VoiceFlowProvider selectedNode={step.id}>
                    <Form defaultValues={flowData} onValidSubmit={jest.fn()}>
                        <TextToSpeechContext.Provider
                            value={
                                {
                                    integrationId: 123,
                                } as TextToSpeechContextType
                            }
                        >
                            <SendToSMSNode {...props} />
                        </TextToSpeechContext.Provider>
                    </Form>
                </VoiceFlowProvider>
            </FlowProvider>,
            {
                entities: {
                    newPhoneNumbers: mockPhoneNumbers,
                } as any,
            } as any,
        )
    }

    it('should render the elements', async () => {
        renderComponent(mockDefaultStep, mockFlowData)

        await waitFor(() => {
            expect(screen.getAllByText('Send to SMS')).toHaveLength(2)
            expect(
                screen.getByText(
                    'Sending to SMS is a final step, you cannot add any other steps after. Once the caller hears the transition message, the call ends.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Step 1: Where should this call go?'),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Select the SMS integrations you want your callers to be deflected to:',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Step 2: Transition message'),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    "Let callers know they're switching to text messaging so they know what to expect next.",
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Step 3: Opening SMS message'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Welcome customers to the text conversation'),
            ).toBeInTheDocument()

            // The description & dropdown show the integration name
            expect(
                screen.getAllByText('Cool SMS Integration (+1 (555) 123-4567)'),
            ).toHaveLength(2)
        })
    })

    it('should display error when no integration is selected', async () => {
        const stepWithoutPhone = mockSendToSMSStep({
            ...mockDefaultStep,
            sms_integration_id: undefined,
        })

        const flowData = mockCallRoutingFlow({
            first_step_id: stepWithoutPhone.id,
            steps: { [stepWithoutPhone.id]: stepWithoutPhone },
        })

        renderComponent(stepWithoutPhone, flowData)

        await waitFor(() => {
            expect(
                screen.getByText('Select SMS integration'),
            ).toBeInTheDocument()
            // error message
            expect(
                screen.getByRole('img', { name: 'octagon-error' }),
            ).toBeInTheDocument()
            // dropdown should show placeholder
            expect(screen.getByText('Select')).toBeInTheDocument()
        })
    })

    it('should show error when SMS content is empty', async () => {
        const stepWithoutContent = mockSendToSMSStep({
            ...mockDefaultStep,
            sms_content: '',
        })

        const flowData = mockCallRoutingFlow({
            first_step_id: stepWithoutContent.id,
            steps: { [stepWithoutContent.id]: stepWithoutContent },
        })

        renderComponent(stepWithoutContent, flowData)

        await waitFor(() => {
            expect(
                screen.getByRole('img', { name: 'octagon-error' }),
            ).toBeInTheDocument()
        })
    })

    it('should show error when confirmation message is invalid', async () => {
        const stepWithInvalidMessage = mockSendToSMSStep({
            ...mockDefaultStep,
            confirmation_message: {
                type: 'none',
            } as any,
        })

        const flowData = mockCallRoutingFlow({
            first_step_id: stepWithInvalidMessage.id,
            steps: { [stepWithInvalidMessage.id]: stepWithInvalidMessage },
        })

        renderComponent(stepWithInvalidMessage, flowData)

        await waitFor(() => {
            expect(
                screen.getByRole('img', { name: 'octagon-error' }),
            ).toBeInTheDocument()
        })
    })

    it('should display placeholder text for SMS content', async () => {
        renderComponent(mockDefaultStep, mockFlowData)

        await waitFor(() => {
            expect(
                screen.getByPlaceholderText(
                    'Hello! Thank you for choosing our messaging service. How can I help you?',
                ),
            ).toBeInTheDocument()
        })
    })

    it('should handle integration with missing phone number ID', async () => {
        const stepWithDifferentPhone = mockSendToSMSStep({
            ...mockDefaultStep,
            sms_integration_id: 456, // This has phone_number_id: 2 which doesn't exist in mockPhoneNumbers
        })

        const flowData = mockCallRoutingFlow({
            first_step_id: stepWithDifferentPhone.id,
            steps: { [stepWithDifferentPhone.id]: stepWithDifferentPhone },
        })

        renderComponent(stepWithDifferentPhone, flowData)

        await waitFor(() => {
            // The description + dropdown should show the integration name
            expect(
                screen.getAllByText('Voice sales SMS', { exact: true }),
            ).toHaveLength(2)
        })
    })

    it('should not render anything when form value does not exist', () => {
        const step = mockSendToSMSStep()
        const flow = {
            steps: {},
        }

        const { container } = renderComponent(step, flow as any)
        expect(container.querySelector('div')).toBeNull()
    })
})
