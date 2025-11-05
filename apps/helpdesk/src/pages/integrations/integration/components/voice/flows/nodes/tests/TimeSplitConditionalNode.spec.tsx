import { ComponentProps } from 'react'

import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCallRoutingFlow,
    mockGetBusinessHoursDetailsHandler,
    mockListAccountSettingsHandler,
    mockTimeSplitConditionalStep,
} from '@gorgias/helpdesk-mocks'
import { BusinessHoursDetails } from '@gorgias/helpdesk-queries'
import {
    TimeSplitConditionalRuleType,
    TimeSplitConditionalStep,
} from '@gorgias/helpdesk-types'

import { Form } from 'core/forms'
import { FlowProvider } from 'core/ui/flows'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { VoiceFlowFormValues } from '../../types'
import VoiceFlowProvider from '../../VoiceFlowProvider'
import { TimeSplitConditionalNode } from '../TimeSplitConditionalNode'

// Mock business hours data
const server = setupServer()
beforeAll(() => {
    server.listen()
})

afterAll(() => {
    server.close()
})

describe('TimeSplitConditionalNode', () => {
    const mockDefaultStep: TimeSplitConditionalStep =
        mockTimeSplitConditionalStep({
            rule_type: TimeSplitConditionalRuleType.BusinessHours,
            custom_hours: {
                business_hours: [
                    {
                        days: '1,2,3,4,5',
                        from_time: '10:00',
                        to_time: '19:00',
                    },
                ],
                timezone: 'America/New_York',
            },
            on_true_step_id: 'step_true',
            on_false_step_id: 'step_false',
        })
    const mockDefaultFlowData = {
        ...mockCallRoutingFlow({
            first_step_id: mockDefaultStep.id,
            steps: { [mockDefaultStep.id]: mockDefaultStep },
        }),
        business_hours_id: 123,
    }

    beforeEach(() => {
        const mockListAccountSettings = mockListAccountSettingsHandler()
        const mockGetBusinessHours = mockGetBusinessHoursDetailsHandler(
            async () =>
                HttpResponse.json({
                    id: 123,
                    name: 'Test Business Hours',
                    business_hours_config: {
                        business_hours: [
                            {
                                days: '1',
                                from_time: '10:00',
                                to_time: '19:00',
                            },
                        ],
                        timezone: 'America/New_York',
                    },
                } as BusinessHoursDetails),
        )

        server.use(mockListAccountSettings.handler)
        server.use(mockGetBusinessHours.handler)
    })

    afterEach(() => {
        server.resetHandlers()
    })

    const renderComponent = (
        mockStep: TimeSplitConditionalStep,
        mockFlowData: VoiceFlowFormValues,
    ) => {
        const props = {
            id: mockStep.id,
            data: mockStep,
        } as ComponentProps<typeof TimeSplitConditionalNode>

        return renderWithStoreAndQueryClientProvider(
            <FlowProvider>
                <VoiceFlowProvider selectedNode={mockStep.id}>
                    <Form
                        defaultValues={mockFlowData}
                        onValidSubmit={jest.fn()}
                    >
                        <TimeSplitConditionalNode {...props} />
                    </Form>
                </VoiceFlowProvider>
            </FlowProvider>,
        )
    }

    describe('Business hours rule', () => {
        it('should render the component with business hours rule type', async () => {
            renderComponent(mockDefaultStep, mockDefaultFlowData)

            expect(screen.getAllByText('Time rule')).toHaveLength(2)

            await waitFor(() => {
                expect(
                    screen.getByText(
                        /Business hours: Monday, 10:00 AM-7:00 PM, America\/New_York/,
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(
                        /Test Business Hours: Monday, 10:00 AM-7:00 PM, America\/New_York/,
                    ),
                ).toBeInTheDocument()

                expect(screen.getByLabelText('Business hours')).toBeChecked()
            })
        })

        it('should default to business hours for no rule type', async () => {
            const step = {
                ...mockDefaultStep,
                rule_type: undefined,
            }
            const mockFlow = {
                ...mockDefaultFlowData,
                steps: { [step.id]: step },
            }
            renderComponent(step, mockFlow)

            expect(screen.getAllByText('Time rule')).toHaveLength(2)

            await waitFor(() => {
                expect(
                    screen.getByText(
                        /Business hours: Monday, 10:00 AM-7:00 PM, America\/New_York/,
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(
                        /Test Business Hours: Monday, 10:00 AM-7:00 PM, America\/New_York/,
                    ),
                ).toBeInTheDocument()

                expect(screen.getByLabelText('Business hours')).toBeChecked()
            })
        })

        it(`should not render anything when form value doesn't exist`, async () => {
            const mockFlow = {
                ...mockDefaultFlowData,
                steps: {},
            }
            const { container } = renderComponent(
                { id: 'abc' } as any,
                mockFlow,
            )

            expect(container.querySelector('div')).toBeNull()
        })

        it('should not render when step is undefined', () => {
            const mockFlow = {
                ...mockDefaultFlowData,
                steps: {
                    [mockDefaultStep.id]: undefined,
                },
            }
            const { container } = renderComponent(
                mockDefaultStep,
                mockFlow as any,
            )

            expect(container.querySelector('div')).toBeNull()
        })
    })

    describe('Custom Hours', () => {
        const customHoursStep: TimeSplitConditionalStep = {
            ...mockDefaultStep,
            rule_type: TimeSplitConditionalRuleType.CustomHours,
            custom_hours: {
                business_hours: [
                    {
                        days: '1,2,3,4,5',
                        from_time: '10:00',
                        to_time: '18:00',
                    },
                ],
                timezone: 'Europe/London',
            },
        }
        const mockFlowData = {
            ...mockDefaultFlowData,
            steps: { [customHoursStep.id]: customHoursStep },
        }

        it('should render custom hours when rule type is custom', async () => {
            renderComponent(customHoursStep, mockFlowData)

            await waitFor(() => {
                expect(screen.getByLabelText('Custom hours')).toBeChecked()

                // we use timezone from custom hours
                expect(
                    screen.getByText(
                        /Custom hours: Mon-Fri, 10:00 AM-6:00 PM, Europe\/London/,
                    ),
                ).toBeInTheDocument()
                expect(screen.getByText('Timezone')).toBeInTheDocument()
                expect(screen.getByText(/add time range/i)).toBeInTheDocument()
            })
        })
    })

    it('should switch from business hours to custom hours when custom radio is clicked', async () => {
        const user = userEvent.setup()
        renderComponent(mockDefaultStep, mockDefaultFlowData)

        await waitFor(() => {
            expect(screen.getByLabelText('Custom hours')).toBeInTheDocument()
        })

        const customHoursRadio = screen.getByLabelText('Custom hours')

        await act(() => user.click(customHoursRadio))

        await waitFor(() => {
            expect(screen.getByText('Timezone')).toBeInTheDocument()
        })
    })

    it('should switch to custom hours with no custom hours set in the step', async () => {
        const user = userEvent.setup()
        const mockStep = {
            ...mockDefaultStep,
            custom_hours: undefined,
        }
        const mockFlow = {
            ...mockDefaultFlowData,
            steps: { [mockStep.id]: mockStep },
        }
        renderComponent(mockStep, mockFlow)

        await waitFor(() => {
            expect(screen.getByLabelText('Custom hours')).toBeInTheDocument()
        })

        const customHoursRadio = screen.getByLabelText('Custom hours')

        await act(() => user.click(customHoursRadio))

        await waitFor(() => {
            expect(screen.getByText('Timezone')).toBeInTheDocument()
            expect(screen.getByText('America/New_York')).toBeInTheDocument()
        })
    })

    it('should show warning when branch options are not pointing to end call', async () => {
        const step = {
            ...mockDefaultStep,
            on_true_step_id: null,
            on_false_step_id: null,
        } as TimeSplitConditionalStep

        const mockFlow = {
            ...mockDefaultFlowData,
            steps: { [step.id]: step },
        }
        renderComponent(step, mockFlow)

        await waitFor(() => {
            expect(
                screen.getByRole('img', { name: 'triangle-warning' }),
            ).toBeInTheDocument()
        })
    })

    it('should show warning icon when business hours are 24/7', async () => {
        const mockGetBusinessHours24_7 = mockGetBusinessHoursDetailsHandler(
            async () =>
                HttpResponse.json({
                    id: 123,
                    name: 'Always On',
                    business_hours_config: {
                        business_hours: [
                            {
                                days: '1,2,3,4,5,6,7',
                                from_time: '00:00',
                                to_time: '00:00',
                            },
                        ],
                        timezone: 'UTC',
                    },
                } as BusinessHoursDetails),
        )

        server.use(mockGetBusinessHours24_7.handler)

        renderComponent(mockDefaultStep, mockDefaultFlowData)

        await waitFor(() => {
            expect(
                screen.getByRole('img', { name: 'triangle-warning' }),
            ).toBeInTheDocument()
        })
    })

    it('should show warning icon when false branch is undefined', async () => {
        const step = {
            ...mockDefaultStep,
            on_false_step_id: null,
        }
        const flow = {
            ...mockCallRoutingFlow({
                first_step_id: step.id,
                steps: { [step.id]: step },
            }),
            business_hours_id: 123,
        }
        renderComponent(step, flow)

        await waitFor(() => {
            expect(
                screen.getByRole('img', { name: 'triangle-warning' }),
            ).toBeInTheDocument()
        })
    })

    it('should show warning icon when true branch is undefined', async () => {
        const step = {
            ...mockDefaultStep,
            on_true_step_id: null,
        }
        const flow = {
            ...mockCallRoutingFlow({
                first_step_id: step.id,
                steps: { [step.id]: step },
            }),
            business_hours_id: 123,
        }
        renderComponent(step, flow)

        await waitFor(() => {
            expect(
                screen.getByRole('img', { name: 'triangle-warning' }),
            ).toBeInTheDocument()
        })
    })
})
