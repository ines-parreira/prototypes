import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { LlmTriggeredExecution } from '../types'
import ActionEventSidePanel from './ActionEventSidePanel'

jest.mock('pages/common/components/Drawer', () => ({
    Drawer: Object.assign(
        ({ children, open }: any) =>
            open ? <div data-testid="drawer">{children}</div> : null,
        {
            Header: ({ children }: any) => <div>{children}</div>,
            HeaderActions: ({ onClose }: any) => (
                <button onClick={onClose}>Close</button>
            ),
            Content: ({ children }: any) => <div>{children}</div>,
        },
    ),
}))

jest.mock('./ActionEventTitle', () => ({
    __esModule: true,
    default: ({ title, status }: { title?: string; status?: string }) => (
        <div data-testid="action-event-title">
            {title} - {status}
        </div>
    ),
}))

jest.mock('./ActionStepAccordionItem', () => ({
    __esModule: true,
    default: ({ step }: { step: any }) => (
        <div data-testid={`action-step-${step.stepId}`}>
            Step: {step.stepId}
            {step.transition && (
                <span data-testid={`transition-${step.stepId}`}>
                    Has transition to: {step.transition.to_step_id}
                </span>
            )}
        </div>
    ),
}))

jest.mock('./ActionEventsCollapsableVariables', () => ({
    __esModule: true,
    default: ({ title, body }: { title: string; body: any }) => (
        <div data-testid={`variables-${title.toLowerCase()}`}>
            {title}: {JSON.stringify(body)}
        </div>
    ),
}))

jest.mock('pages/common/components/accordion/Accordion', () => ({
    __esModule: true,
    default: ({ children }: any) => <div>{children}</div>,
}))

const middlewares = [thunk]
const mockStore = configureStore(middlewares)({})
const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
})

const renderComponent = (props: {
    isOpen: boolean
    actionConfiguration?: any
    execution?: LlmTriggeredExecution
    httpExecutionLogs?: any
    templateConfigurations?: any[]
    isLoading?: boolean
    onClose?: () => void
}) => {
    return render(
        <Provider store={mockStore}>
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <ActionEventSidePanel
                        isOpen={props.isOpen}
                        actionConfiguration={props.actionConfiguration}
                        execution={props.execution}
                        httpExecutionLogs={props.httpExecutionLogs}
                        templateConfigurations={props.templateConfigurations}
                        isLoading={props.isLoading || false}
                        onClose={props.onClose || jest.fn()}
                    />
                </MemoryRouter>
            </QueryClientProvider>
        </Provider>,
    )
}

describe('ActionEventSidePanel', () => {
    describe('transition finding logic (lines 65-67)', () => {
        it('should correctly find and attach transition to step when transition exists', () => {
            const execution: LlmTriggeredExecution = {
                status: 'success',
                state: {
                    steps_state: {
                        'step-1': {
                            kind: 'http-request',
                            at: '2024-01-01T00:00:00Z',
                            success: true,
                        },
                        'step-2': {
                            kind: 'http-request',
                            at: '2024-01-01T00:01:00Z',
                            success: true,
                        },
                    },
                    transitions: {
                        'transition-1': {
                            name: 'Test Transition',
                            from_step_id: 'step-1',
                            to_step_id: 'step-2',
                            conditions: { and: [] },
                        },
                    },
                    objects: {},
                    custom_inputs: {},
                },
            } as any

            renderComponent({
                isOpen: true,
                execution,
            })

            expect(screen.getByTestId('action-step-step-2')).toBeInTheDocument()
            expect(screen.getByTestId('transition-step-2')).toBeInTheDocument()
            expect(
                screen.getByText('Has transition to: step-2'),
            ).toBeInTheDocument()
        })

        it('should handle step without transition correctly', () => {
            const execution: LlmTriggeredExecution = {
                status: 'success',
                state: {
                    steps_state: {
                        'step-1': {
                            kind: 'http-request',
                            at: '2024-01-01T00:00:00Z',
                            success: true,
                        },
                        'step-2': {
                            kind: 'http-request',
                            at: '2024-01-01T00:01:00Z',
                            success: true,
                        },
                    },
                    transitions: {
                        'transition-1': {
                            name: 'Test Transition',
                            from_step_id: 'step-2',
                            to_step_id: 'step-3',
                            conditions: { and: [] },
                        },
                    },
                    objects: {},
                    custom_inputs: {},
                },
            } as any

            renderComponent({
                isOpen: true,
                execution,
            })

            expect(screen.getByTestId('action-step-step-1')).toBeInTheDocument()
            expect(
                screen.queryByTestId('transition-step-1'),
            ).not.toBeInTheDocument()
        })

        it('should handle multiple transitions and match the correct one', () => {
            const execution: LlmTriggeredExecution = {
                status: 'success',
                state: {
                    steps_state: {
                        'step-1': {
                            kind: 'http-request',
                            at: '2024-01-01T00:00:00Z',
                            success: true,
                        },
                        'step-2': {
                            kind: 'http-request',
                            at: '2024-01-01T00:01:00Z',
                            success: true,
                        },
                        'step-3': {
                            kind: 'http-request',
                            at: '2024-01-01T00:02:00Z',
                            success: true,
                        },
                    },
                    transitions: {
                        'transition-1': {
                            name: 'First Transition',
                            from_step_id: 'step-1',
                            to_step_id: 'step-2',
                            conditions: { and: [] },
                        },
                        'transition-2': {
                            name: 'Second Transition',
                            from_step_id: 'step-2',
                            to_step_id: 'step-3',
                            conditions: { and: [] },
                        },
                    },
                    objects: {},
                    custom_inputs: {},
                },
            } as any

            renderComponent({
                isOpen: true,
                execution,
            })

            expect(screen.getByTestId('transition-step-2')).toBeInTheDocument()
            expect(screen.getByTestId('transition-step-3')).toBeInTheDocument()
            expect(
                screen.queryByTestId('transition-step-1'),
            ).not.toBeInTheDocument()
        })

        it('should handle execution with no transitions', () => {
            const execution: LlmTriggeredExecution = {
                status: 'success',
                state: {
                    steps_state: {
                        'step-1': {
                            kind: 'http-request',
                            at: '2024-01-01T00:00:00Z',
                            success: true,
                        },
                        'step-2': {
                            kind: 'http-request',
                            at: '2024-01-01T00:01:00Z',
                            success: true,
                        },
                    },
                    transitions: {},
                    objects: {},
                    custom_inputs: {},
                },
            } as any

            renderComponent({
                isOpen: true,
                execution,
            })

            expect(screen.getByTestId('action-step-step-1')).toBeInTheDocument()
            expect(screen.getByTestId('action-step-step-2')).toBeInTheDocument()
            expect(
                screen.queryByTestId('transition-step-1'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByTestId('transition-step-2'),
            ).not.toBeInTheDocument()
        })

        it('should handle execution with undefined transitions', () => {
            const execution: LlmTriggeredExecution = {
                status: 'success',
                state: {
                    steps_state: {
                        'step-1': {
                            kind: 'http-request',
                            at: '2024-01-01T00:00:00Z',
                            success: true,
                        },
                    },
                    objects: {},
                    custom_inputs: {},
                },
            } as any

            renderComponent({
                isOpen: true,
                execution,
            })

            expect(screen.getByTestId('action-step-step-1')).toBeInTheDocument()
            expect(
                screen.queryByTestId('transition-step-1'),
            ).not.toBeInTheDocument()
        })

        it('should correctly find transition even with complex transition IDs', () => {
            const execution: LlmTriggeredExecution = {
                status: 'success',
                state: {
                    steps_state: {
                        'step-uuid-123': {
                            kind: 'http-request',
                            at: '2024-01-01T00:00:00Z',
                            success: true,
                        },
                        'step-uuid-456': {
                            kind: 'http-request',
                            at: '2024-01-01T00:01:00Z',
                            success: true,
                        },
                    },
                    transitions: {
                        'complex-transition-id-789': {
                            name: 'Complex Transition',
                            from_step_id: 'step-uuid-123',
                            to_step_id: 'step-uuid-456',
                            conditions: { and: [] },
                        },
                    },
                    objects: {},
                    custom_inputs: {},
                },
            } as any

            renderComponent({
                isOpen: true,
                execution,
            })

            expect(
                screen.getByTestId('action-step-step-uuid-456'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('transition-step-uuid-456'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Has transition to: step-uuid-456'),
            ).toBeInTheDocument()
        })
    })

    describe('steps processing and filtering', () => {
        it('should filter out end steps', () => {
            const execution: LlmTriggeredExecution = {
                status: 'success',
                state: {
                    steps_state: {
                        'step-1': {
                            kind: 'http-request',
                            at: '2024-01-01T00:00:00Z',
                            success: true,
                        },
                        'step-2': {
                            kind: 'end',
                            at: '2024-01-01T00:01:00Z',
                            success: true,
                        },
                    },
                    transitions: {},
                    objects: {},
                    custom_inputs: {},
                },
            } as any

            renderComponent({
                isOpen: true,
                execution,
            })

            expect(screen.getByTestId('action-step-step-1')).toBeInTheDocument()
            expect(
                screen.queryByTestId('action-step-step-2'),
            ).not.toBeInTheDocument()
        })

        it('should sort steps by timestamp', () => {
            const execution: LlmTriggeredExecution = {
                status: 'success',
                state: {
                    steps_state: {
                        'step-3': {
                            kind: 'http-request',
                            at: '2024-01-01T00:02:00Z',
                            success: true,
                        },
                        'step-1': {
                            kind: 'http-request',
                            at: '2024-01-01T00:00:00Z',
                            success: true,
                        },
                        'step-2': {
                            kind: 'http-request',
                            at: '2024-01-01T00:01:00Z',
                            success: true,
                        },
                    },
                    transitions: {},
                    objects: {},
                    custom_inputs: {},
                },
            } as any

            const { container } = renderComponent({
                isOpen: true,
                execution,
            })

            const steps = container.querySelectorAll(
                '[data-testid^="action-step-"]',
            )
            expect(steps[0]).toHaveAttribute(
                'data-testid',
                'action-step-step-1',
            )
            expect(steps[1]).toHaveAttribute(
                'data-testid',
                'action-step-step-2',
            )
            expect(steps[2]).toHaveAttribute(
                'data-testid',
                'action-step-step-3',
            )
        })
    })

    describe('component behavior', () => {
        it('should not render when isOpen is false', () => {
            renderComponent({
                isOpen: false,
                execution: {
                    status: 'success',
                    state: {
                        steps_state: {},
                        transitions: {},
                        objects: {},
                        custom_inputs: {},
                    },
                } as any,
            })

            expect(screen.queryByTestId('drawer')).not.toBeInTheDocument()
        })

        it('should handle empty execution state', () => {
            renderComponent({
                isOpen: true,
                execution: undefined,
            })

            expect(screen.getByTestId('drawer')).toBeInTheDocument()
            expect(
                screen.queryByTestId('action-step-step-1'),
            ).not.toBeInTheDocument()
        })

        it('should handle execution with empty steps_state', () => {
            const execution: LlmTriggeredExecution = {
                status: 'success',
                state: {
                    steps_state: {},
                    transitions: {},
                    objects: {},
                    custom_inputs: {},
                },
            } as any

            renderComponent({
                isOpen: true,
                execution,
            })

            expect(screen.getByTestId('drawer')).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /Action steps/i }),
            ).not.toBeInTheDocument()
        })

        it('should handle execution with undefined steps_state', () => {
            const execution: LlmTriggeredExecution = {
                status: 'success',
                state: {
                    transitions: {},
                    objects: {},
                    custom_inputs: {},
                },
            } as any

            renderComponent({
                isOpen: true,
                execution,
            })

            expect(screen.getByTestId('drawer')).toBeInTheDocument()
        })
    })
})
