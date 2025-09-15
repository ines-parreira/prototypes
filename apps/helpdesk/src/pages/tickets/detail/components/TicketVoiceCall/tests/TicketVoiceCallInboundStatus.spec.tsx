import { assumeMock } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'

import {
    mockGetVoiceQueueHandler,
    mockVoiceQueue,
} from '@gorgias/helpdesk-mocks'
import {
    PhoneRingingBehaviour,
    useGetVoiceQueue,
} from '@gorgias/helpdesk-queries'

import {
    getInboundDisplayStatus,
    VoiceCall,
    VoiceCallDisplayStatus,
    VoiceCallSubject,
    VoiceCallSubjectType,
} from 'models/voiceCall/types'
import {
    getAnsweringVoiceSubject,
    isCallTransfer,
} from 'models/voiceCall/utils'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { TicketVoiceCallInboundStatus } from '../TicketVoiceCallInboundStatus'

jest.mock(
    'pages/common/components/VoiceCallSubjectLabel/VoiceCallSubjectLabel',
    () =>
        ({ subject }: { subject: VoiceCallSubject }) => {
            if (subject.type === 'agent') {
                return (
                    <div data-interactable="true">
                        VoiceCallSubjectLabel Agent {subject.id}
                    </div>
                )
            }
            if (subject.type === 'external') {
                return (
                    <div data-interactable="false">
                        VoiceCallSubjectLabel External {subject.value}
                    </div>
                )
            }
        },
)

jest.mock(
    'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel',
    () =>
        ({ agentId }: { agentId: number }) => (
            <div>VoiceCallAgentLabel {agentId}</div>
        ),
)

jest.mock('../TicketVoiceCallEvents', () => ({ callId }: any) => (
    <div data-testid="ticket-voice-call-events">{callId}</div>
))

jest.mock('../CollapsibleDetails', () => ({ title, children }: any) => (
    <div data-testid="collapsible-details">
        <div>{title}</div>
        <div>{children}</div>
    </div>
))

jest.mock('models/voiceCall/types', () => {
    const originalModule = jest.requireActual('models/voiceCall/types')
    return {
        ...originalModule,
        getInboundDisplayStatus: jest.fn(),
    }
})

jest.mock('models/voiceCall/utils', () => {
    const originalModule = jest.requireActual('models/voiceCall/utils')
    return {
        ...originalModule,
        getAnsweringVoiceSubject: jest.fn(),
        isCallTransfer: jest.fn(),
    }
})

const getInboundDisplayStatusMock = assumeMock(getInboundDisplayStatus)
const getAnsweringVoiceSubjectMock = assumeMock(getAnsweringVoiceSubject)
const isCallTransferMock = assumeMock(isCallTransfer)

jest.mock('@gorgias/helpdesk-queries')
const useGetVoiceQueueMock = assumeMock(useGetVoiceQueue)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    isCallTransferMock.mockReturnValue(false)
})

afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

const renderComponent = (voiceCall: VoiceCall) => {
    return renderWithQueryClientProvider(
        <TicketVoiceCallInboundStatus voiceCall={voiceCall} />,
    )
}

describe('TicketVoiceCallInboundStatus', () => {
    it('should render "Routing"', () => {
        getInboundDisplayStatusMock.mockReturnValue(
            VoiceCallDisplayStatus.Routing,
        )
        const { getByText } = renderComponent({} as VoiceCall)
        expect(getByText('Routing')).toBeInTheDocument()
    })

    it.each([
        VoiceCallDisplayStatus.InProgress,
        VoiceCallDisplayStatus.Answered,
    ])(
        'should render "Answered by" and agent label when display status is %s',
        (displayStatus) => {
            const voiceCall = {
                last_answered_by_agent_id: 1,
            } as VoiceCall

            getInboundDisplayStatusMock.mockReturnValue(displayStatus)
            getAnsweringVoiceSubjectMock.mockReturnValue({
                type: VoiceCallSubjectType.Agent,
                id: 1,
            })
            const { getByText, getByTestId, container } =
                renderComponent(voiceCall)
            expect(getByText('Answered by')).toBeInTheDocument()
            expect(
                getByText('VoiceCallSubjectLabel Agent 1'),
            ).toBeInTheDocument()
            expect(getByTestId('collapsible-details')).toBeInTheDocument()
            const agentLabel = container.querySelector(
                '[data-interactable="true"]',
            )
            expect(agentLabel).toBeInTheDocument()
            expect(getAnsweringVoiceSubjectMock).toHaveBeenCalledWith(voiceCall)
        },
    )

    it.each([
        VoiceCallDisplayStatus.InProgress,
        VoiceCallDisplayStatus.Answered,
    ])(
        'should render "Answered by" and external number label when display status is %s',
        (displayStatus) => {
            const voiceCall = {
                answered_by_external_number: '+1234567890',
            } as VoiceCall

            getInboundDisplayStatusMock.mockReturnValue(displayStatus)
            getAnsweringVoiceSubjectMock.mockReturnValue({
                type: VoiceCallSubjectType.External,
                value: '+1234567890',
            })
            const { getByText, getByTestId } = renderComponent(voiceCall)
            expect(getByText('Answered by')).toBeInTheDocument()
            expect(
                getByText('VoiceCallSubjectLabel External +1234567890'),
            ).toBeInTheDocument()
            expect(getByTestId('collapsible-details')).toBeInTheDocument()
            expect(getAnsweringVoiceSubjectMock).toHaveBeenCalledWith(voiceCall)
        },
    )

    it('should render "Queued" when display status is "Queued" and not a transfer', () => {
        getInboundDisplayStatusMock.mockReturnValue(
            VoiceCallDisplayStatus.Queued,
        )
        const { getByText } = renderComponent({} as VoiceCall)
        expect(getByText('Queued')).toBeInTheDocument()
    })

    it('should render "Transferring to queue..." when display status is "Queued" and is a transfer', () => {
        getInboundDisplayStatusMock.mockReturnValue(
            VoiceCallDisplayStatus.Queued,
        )
        isCallTransferMock.mockReturnValue(true)
        const { getByText, getByTestId } = renderComponent({} as VoiceCall)
        expect(getByText('Transferring to queue...')).toBeInTheDocument()
        expect(getByTestId('collapsible-details')).toBeInTheDocument()
    })

    describe('Calling', () => {
        it('should render "Calling agents" when display status is "Calling" and distribution mode is "Broadcast"', async () => {
            const mockGetVoiceQueue = mockGetVoiceQueueHandler()
            mockGetVoiceQueue.data = mockVoiceQueue({
                distribution_mode: PhoneRingingBehaviour.Broadcast,
            })
            server.use(mockGetVoiceQueue.handler)

            useGetVoiceQueueMock.mockReturnValue({
                data: {
                    data: mockGetVoiceQueue.data,
                },
                isLoading: false,
                isError: false,
            } as any)

            getInboundDisplayStatusMock.mockReturnValue(
                VoiceCallDisplayStatus.Calling,
            )

            const { getByText } = renderComponent({
                queue_id: 1,
            } as VoiceCall)

            await waitFor(() => {
                expect(getByText('Calling agents')).toBeInTheDocument()
            })
        })

        it('should render "Calling <agent> when display status is "Calling" and distribution mode is "Round Robin"', async () => {
            const mockGetVoiceQueue = mockGetVoiceQueueHandler()
            mockGetVoiceQueue.data = mockVoiceQueue({
                distribution_mode: PhoneRingingBehaviour.RoundRobin,
            })
            server.use(mockGetVoiceQueue.handler)

            useGetVoiceQueueMock.mockReturnValue({
                data: {
                    data: mockGetVoiceQueue.data,
                },
                isLoading: false,
                isError: false,
            } as any)

            getInboundDisplayStatusMock.mockReturnValue(
                VoiceCallDisplayStatus.Calling,
            )

            const { getByText } = renderComponent({
                queue_id: 1,
                last_rang_agent_id: 3,
                phone_number_destination: '1234567890',
            } as VoiceCall)

            await waitFor(() => {
                expect(getByText('Calling')).toBeInTheDocument()
                expect(getByText('VoiceCallAgentLabel 3')).toBeInTheDocument()
            })
        })

        describe('transfer scenarios', () => {
            beforeEach(() => {
                isCallTransferMock.mockReturnValue(true)
            })

            it('should render "Transferring to agents" when display status is "Calling", is a transfer, and distribution mode is "Broadcast"', async () => {
                const mockGetVoiceQueue = mockGetVoiceQueueHandler()
                mockGetVoiceQueue.data = mockVoiceQueue({
                    distribution_mode: PhoneRingingBehaviour.Broadcast,
                })
                server.use(mockGetVoiceQueue.handler)

                useGetVoiceQueueMock.mockReturnValue({
                    data: {
                        data: mockGetVoiceQueue.data,
                    },
                    isLoading: false,
                    isError: false,
                } as any)

                getInboundDisplayStatusMock.mockReturnValue(
                    VoiceCallDisplayStatus.Calling,
                )

                const { getByText, getByTestId } = renderComponent({
                    queue_id: 1,
                } as VoiceCall)

                await waitFor(() => {
                    expect(
                        getByText('Transferring to agents'),
                    ).toBeInTheDocument()
                    expect(
                        getByTestId('collapsible-details'),
                    ).toBeInTheDocument()
                })
            })

            it('should render "Transferring to <agent>" when display status is "Calling", is a transfer, and distribution mode is "Round Robin"', async () => {
                const mockGetVoiceQueue = mockGetVoiceQueueHandler()
                mockGetVoiceQueue.data = mockVoiceQueue({
                    distribution_mode: PhoneRingingBehaviour.RoundRobin,
                })
                server.use(mockGetVoiceQueue.handler)

                useGetVoiceQueueMock.mockReturnValue({
                    data: {
                        data: mockGetVoiceQueue.data,
                    },
                    isLoading: false,
                    isError: false,
                } as any)

                getInboundDisplayStatusMock.mockReturnValue(
                    VoiceCallDisplayStatus.Calling,
                )

                const { getByText, getByTestId } = renderComponent({
                    queue_id: 1,
                    last_rang_agent_id: 3,
                    phone_number_destination: '1234567890',
                } as VoiceCall)

                await waitFor(() => {
                    expect(getByText('Transferring to')).toBeInTheDocument()
                    expect(
                        getByText('VoiceCallAgentLabel 3'),
                    ).toBeInTheDocument()
                    expect(
                        getByTestId('collapsible-details'),
                    ).toBeInTheDocument()
                })
            })

            it('should render "Transferring to" with loading skeleton when queue is loading', async () => {
                useGetVoiceQueueMock.mockReturnValue({
                    data: null,
                    isLoading: true,
                    isError: false,
                } as any)

                getInboundDisplayStatusMock.mockReturnValue(
                    VoiceCallDisplayStatus.Calling,
                )

                const { getByText, getByTestId } = renderComponent({
                    queue_id: 1,
                } as VoiceCall)

                await waitFor(() => {
                    expect(getByText('Transferring to')).toBeInTheDocument()
                    expect(
                        getByTestId('collapsible-details'),
                    ).toBeInTheDocument()
                })
            })
        })
    })

    it.each([
        {
            displayStatus: VoiceCallDisplayStatus.Missed,
            colorClass: 'errorStatus',
            textToDisplay: 'Missed call',
            iconToDisplay: 'call_missed',
        },
        {
            displayStatus: VoiceCallDisplayStatus.Abandoned,
            colorClass: 'errorStatus',
            textToDisplay: 'Abandoned call',
            iconToDisplay: 'call_missed',
        },
        {
            displayStatus: VoiceCallDisplayStatus.Cancelled,
            colorClass: 'greyStatus',
            textToDisplay: 'Cancelled call',
            iconToDisplay: 'call_missed',
        },
        {
            displayStatus: VoiceCallDisplayStatus.CallbackRequested,
            colorClass: 'errorStatus',
            textToDisplay: 'Callback requested',
            iconToDisplay: 'phone_callback',
        },
    ])(
        'should render "$textToDisplay" when display status is $displayStatus',
        ({ displayStatus, colorClass, textToDisplay, iconToDisplay }) => {
            getInboundDisplayStatusMock.mockReturnValue(displayStatus)
            const { getByText, getByTestId, container } = renderComponent({
                last_answered_by_agent_id: null,
                phone_number_destination: '1234567890',
            } as VoiceCall)
            expect(getByText(textToDisplay)).toBeInTheDocument()
            expect(getByText(iconToDisplay)).toBeInTheDocument()
            expect(getByTestId('collapsible-details')).toBeInTheDocument()
            expect(
                getByTestId('collapsible-details').querySelector(
                    `.${colorClass}`,
                ),
            ).toBeInTheDocument()
            const agentLabel = container.querySelector(
                '[data-interactable="true"]',
            )
            expect(agentLabel).not.toBeInTheDocument()
        },
    )

    it('should render null when voice call state is invalid', () => {
        getInboundDisplayStatusMock.mockReturnValue(null)
        const voiceCall: VoiceCall = {
            phone_number_destination: '1234567890',
        } as VoiceCall
        const { container } = renderComponent(voiceCall)
        expect(container.firstChild).toBeNull()
    })
})
