import { Form } from '@repo/forms'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { Box } from '@gorgias/axiom'
import {
    mockCallRoutingFlow,
    mockGetBusinessHoursDetailsHandler,
    mockListAccountSettingsHandler,
    mockPlayMessageStep,
    mockTimeSplitConditionalStep,
} from '@gorgias/helpdesk-mocks'
import type { BusinessHoursDetails } from '@gorgias/helpdesk-queries'
import type { TimeSplitConditionalStep } from '@gorgias/helpdesk-types'
import { TimeSplitConditionalRuleType } from '@gorgias/helpdesk-types'

import { FlowProvider } from 'core/ui/flows'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import type { VoiceFlowFormValues } from '../../types'
import { VoiceFlow } from '../../VoiceFlow'

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
            on_true_step_id: 'next-step-true',
            on_false_step_id: 'next-step-false',
        })
    const mockOnTrueStep = mockPlayMessageStep({
        id: 'next-step-true',
        next_step_id: null,
    })
    const mockOnFalseStep = mockPlayMessageStep({
        id: 'next-step-false',
        next_step_id: null,
    })
    const mockDefaultFlowData = {
        ...mockCallRoutingFlow({
            first_step_id: mockDefaultStep.id,
            steps: {
                [mockDefaultStep.id]: mockDefaultStep,
                'next-step-true': mockOnTrueStep,
                'next-step-false': mockOnFalseStep,
            },
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

    const renderComponent = (mockFlowData: VoiceFlowFormValues) => {
        return renderWithStoreAndQueryClientProvider(
            <FlowProvider>
                <Box width="100%" height="100%">
                    <Form
                        defaultValues={mockFlowData}
                        onValidSubmit={jest.fn()}
                    >
                        <VoiceFlow flow={mockFlowData} />
                    </Form>
                </Box>
            </FlowProvider>,
        )
    }

    it('should render the component with business hours rule type', async () => {
        renderComponent(mockDefaultFlowData)

        await waitFor(() => {
            expect(
                screen.getByText('Inside business hours'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Outside business hours'),
            ).toBeInTheDocument()
        })
    })

    it('should render the component with custom hours rule type', async () => {
        const customStep: TimeSplitConditionalStep = {
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
            first_step_id: customStep.id,
            steps: {
                [customStep.id]: customStep,
                'next-step-true': mockOnTrueStep,
                'next-step-false': mockOnFalseStep,
            },
        }

        renderComponent(mockFlowData)

        await waitFor(() => {
            expect(screen.getByText('Inside custom hours')).toBeInTheDocument()
            expect(screen.getByText('Outside custom hours')).toBeInTheDocument()
        })
    })
})
