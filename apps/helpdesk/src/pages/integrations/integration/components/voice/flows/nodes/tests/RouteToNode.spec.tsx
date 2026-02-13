import type { ComponentProps } from 'react'

import { Form } from '@repo/forms'
import { screen } from '@testing-library/react'
import { setupServer } from 'msw/node'

import {
    mockCallRoutingFlow,
    mockEnqueueStep,
    mockGetIntegrationHandler,
    mockGetVoiceQueueHandler,
    mockRouteToInternalNumber,
} from '@gorgias/helpdesk-mocks'
import type {
    CallRoutingFlow,
    EnqueueStep,
    RouteToInternalNumber,
} from '@gorgias/helpdesk-types'

import { FlowProvider } from 'core/ui/flows'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import type { TextToSpeechContext as TextToSpeechContextType } from '../../../VoiceMessageTTS/TextToSpeechContext'
import TextToSpeechContext from '../../../VoiceMessageTTS/TextToSpeechContext'
import VoiceFlowProvider from '../../VoiceFlowProvider'
import { RouteToNode } from '../RouteToNode'

jest.mock(
    'pages/integrations/integration/components/voice/VoiceQueueSelectField.tsx',
    () => () => <div>VoiceQueueSelectField</div>,
)
jest.mock(
    'pages/integrations/integration/components/voice/VoiceIntegrationSelectField.tsx',
    () => () => <div>VoiceIntegrationSelectField</div>,
)

const server = setupServer()
beforeAll(() => {
    server.listen()
})

afterAll(() => {
    server.close()
})

const renderComponent = (
    mockStep: RouteToInternalNumber | EnqueueStep,
    flow?: CallRoutingFlow,
) => {
    const mockFlow =
        flow ||
        mockCallRoutingFlow({
            first_step_id: mockStep.id,
            steps: { [mockStep.id]: mockStep },
        })

    const props = {
        id: mockStep.id,
        data: mockStep,
    } as ComponentProps<typeof RouteToNode>

    return renderWithStoreAndQueryClientAndRouter(
        <FlowProvider>
            <VoiceFlowProvider selectedNode={mockStep.id}>
                <Form defaultValues={mockFlow} onValidSubmit={jest.fn()}>
                    <TextToSpeechContext.Provider
                        value={
                            { integrationId: 123 } as TextToSpeechContextType
                        }
                    >
                        <RouteToNode {...props} />
                    </TextToSpeechContext.Provider>
                </Form>
            </VoiceFlowProvider>
        </FlowProvider>,
        {},
        {
            route: '/123',
            path: '/:integrationId',
        },
    )
}

describe('RouteToNode', () => {
    beforeEach(() => {
        const mockGetVoiceQueue = mockGetVoiceQueueHandler()
        const mockGetIntegration = mockGetIntegrationHandler()
        server.use(mockGetVoiceQueue.handler)
        server.use(mockGetIntegration.handler)
    })

    it('renders with correct icon', () => {
        const mockStep = mockRouteToInternalNumber()
        renderComponent(mockStep)
        expect(screen.getByLabelText('arrow-routing')).toBeInTheDocument()
    })

    it('handles empty step', () => {
        const mockStep = mockRouteToInternalNumber()
        renderComponent(mockStep, { first_step_id: null, steps: {} } as any)
        expect(screen.queryByRole('arrow-routing')).toBeNull()
    })

    describe('when the step type is Enqueue', () => {
        it('should render first step form field', () => {
            const mockStep = mockEnqueueStep()
            renderComponent(mockStep)
            expect(
                screen.getByText('Step 1: Where should this call go?'),
            ).toBeInTheDocument()
        })

        it('should render the Enqueue node when the step type is Enqueue', () => {
            const mockStep = mockEnqueueStep({
                queue_id: null!,
            })

            renderComponent(mockStep)

            expect(screen.getByText('Select queue')).toBeInTheDocument()
            expect(
                screen.getByText('VoiceQueueSelectField'),
            ).toBeInTheDocument()
        })

        it('should display error when queue is not selected', () => {
            const mockStep = mockEnqueueStep({
                queue_id: null!,
            })
            renderComponent(mockStep)
            expect(
                screen.getByRole('img', { name: 'octagon-error' }),
            ).toBeInTheDocument()
        })

        it.each(['test', null])(
            'should not display warning no matter the a next step',
            (nextStep: string | null) => {
                const mockStep = mockEnqueueStep({
                    next_step_id: nextStep,
                })
                renderComponent(mockStep)
                expect(
                    screen.queryByRole('img', { name: 'triangle-warning' }),
                ).toBeNull()
            },
        )
    })

    describe('when the step type is Route to internal number', () => {
        it('should render first step form field', () => {
            const mockStep = mockRouteToInternalNumber()
            renderComponent(mockStep)
            expect(
                screen.getByText('Step 1: Where should this call go?'),
            ).toBeInTheDocument()
        })

        it('should render the Route to internal number node when the step type is Route to internal number', () => {
            const mockStep = mockRouteToInternalNumber({
                integration_id: null!,
            })

            renderComponent(mockStep)

            expect(screen.getByText('Select integration')).toBeInTheDocument()
            expect(
                screen.getByText('VoiceIntegrationSelectField'),
            ).toBeInTheDocument()

            expect(
                screen.getByText(
                    'Please note that routing to a voice integration ends the call. All following steps will be ignored.',
                ),
            ).toBeInTheDocument()
        })

        it('should display error when integration is not selected', () => {
            const mockStep = mockRouteToInternalNumber({
                integration_id: null!,
            })
            renderComponent(mockStep)
            expect(
                screen.getByRole('img', { name: 'octagon-error' }),
            ).toBeInTheDocument()
        })

        it('should display warning when we have next steps', () => {
            const mockStep = mockRouteToInternalNumber({
                next_step_id: 'some_step_id',
            })
            renderComponent(mockStep)
            expect(
                screen.getByRole('img', { name: 'triangle-warning' }),
            ).toBeInTheDocument()
        })

        it('should not display warning when we have no next step', () => {
            const mockStep = mockRouteToInternalNumber({
                next_step_id: null,
            })
            renderComponent(mockStep)
            expect(
                screen.queryByRole('img', { name: 'triangle-warning' }),
            ).toBeNull()
        })
    })
})
