import { ComponentProps } from 'react'

import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCallRoutingFlow,
    mockForwardToExternalNumberStep,
    mockListPhoneNumbersHandler,
} from '@gorgias/helpdesk-mocks'
import {
    CallRoutingFlow,
    ForwardToExternalNumberStep,
    ListPhoneNumbers200DataItem,
} from '@gorgias/helpdesk-types'

import { Form } from 'core/forms'
import { FlowProvider } from 'core/ui/flows'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { ForwardToNode } from '../ForwardToNode'

const defaultHandler = mockListPhoneNumbersHandler(async () =>
    HttpResponse.json({
        data: [],
        meta: {
            next_cursor: null,
            prev_cursor: null,
        },
        object: 'list',
        uri: '/api/phone-numbers',
    }),
)

const server = setupServer(defaultHandler.handler)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    server.use(defaultHandler.handler)
})

afterAll(() => {
    server.close()
})

const renderComponent = (
    mockStepData: Partial<ForwardToExternalNumberStep> = {},
    flow?: CallRoutingFlow,
    phoneNumbersMock?: ListPhoneNumbers200DataItem,
) => {
    const mockHandler = mockListPhoneNumbersHandler(async () =>
        HttpResponse.json({
            data: phoneNumbersMock ? [phoneNumbersMock] : [],
            meta: {
                next_cursor: null,
                prev_cursor: null,
            },
            object: 'list',
            uri: '/api/phone-numbers',
        }),
    )
    server.use(mockHandler.handler)

    const mockStep = mockForwardToExternalNumberStep({
        external_number: '',
        ...mockStepData,
    })

    const mockFlow =
        flow ||
        mockCallRoutingFlow({
            first_step_id: mockStep.id,
            steps: { [mockStep.id]: mockStep },
        })

    const props = {
        data: mockStep,
    } as ComponentProps<typeof ForwardToNode>

    return renderWithQueryClientProvider(
        <FlowProvider>
            <Form defaultValues={mockFlow} onValidSubmit={jest.fn()}>
                <ForwardToNode {...props} />
            </Form>
        </FlowProvider>,
    )
}

describe('ForwardToNode', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Rendering', () => {
        it('should render the node', () => {
            renderComponent()

            expect(screen.getAllByText('Forward to')).toHaveLength(2)
            expect(screen.getByText('Phone number')).toBeInTheDocument()
            expect(screen.getByText('Select phone number')).toBeInTheDocument()
        })

        it('should render with phone number as description when provided', () => {
            renderComponent({ external_number: '+15551234567' })

            expect(screen.getByText('+15551234567')).toBeInTheDocument()
        })
    })

    describe('Phone Number Validation', () => {
        it('should show error when phone number is empty', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.hover(
                    screen.getByRole('img', { name: 'octagon-warning' }),
                )
            })

            await waitFor(() => {
                expect(
                    screen.getByText('Phone number is required'),
                ).toBeInTheDocument()
            })
        })

        it('should show error for invalid phone number', async () => {
            const user = userEvent.setup()
            renderComponent({ external_number: '123' })

            await act(async () => {
                await user.hover(
                    screen.getByRole('img', { name: 'octagon-warning' }),
                )
            })

            await waitFor(() => {
                expect(
                    screen.getByText('Invalid phone number'),
                ).toBeInTheDocument()
            })
        })

        it('should not show error for valid US phone number', async () => {
            renderComponent({ external_number: '+12125551234' })

            await waitFor(() => {
                expect(screen.queryByText('warning_amber')).toBeNull()
            })
        })

        it('should not show error for valid international phone number', async () => {
            renderComponent({ external_number: '+442071234567' })

            await waitFor(() => {
                expect(screen.queryByText('warning_amber')).toBeNull()
            })
        })
    })

    describe('Internal Number Validation', () => {
        it('should show error when forwarding to internal number', async () => {
            const user = userEvent.setup()
            const internalPhoneNumber = '+12125551234'

            renderComponent(
                { external_number: internalPhoneNumber },
                undefined,
                {
                    phone_number: internalPhoneNumber,
                } as ListPhoneNumbers200DataItem,
            )

            await waitFor(() => {
                expect(
                    screen.getByText(
                        /For forwarding to internal numbers, please use a/,
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.getByRole('img', { name: 'octagon-warning' }),
                ).toBeInTheDocument()
            })

            await act(async () => {
                await user.hover(
                    screen.getByRole('img', { name: 'octagon-warning' }),
                )
            })

            await waitFor(() => {
                expect(
                    screen.getByText('Cannot forward to an internal number'),
                ).toBeInTheDocument()
            })
        })

        it('should not show error when forwarding to external number', async () => {
            const externalPhoneNumber = '+12125551234'

            renderComponent({ external_number: externalPhoneNumber })

            await waitFor(() => {
                expect(
                    screen.queryByRole('img', { name: 'octagon-warning' }),
                ).toBeNull()
            })

            expect(
                screen.queryByText(
                    /For forwarding to internal numbers, please use the "Route to" step/,
                ),
            ).not.toBeInTheDocument()
        })
    })

    it('should not render node when form value does not exist', () => {
        const step = mockForwardToExternalNumberStep()
        const flow = {
            steps: {},
        }

        renderComponent(step, flow as any)

        expect(screen.queryByText('Forward to')).not.toBeInTheDocument()
    })
})
