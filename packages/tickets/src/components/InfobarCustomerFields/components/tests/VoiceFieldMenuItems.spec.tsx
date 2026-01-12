import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetCurrentUserHandler,
    mockPhoneIntegration,
    mockSmsIntegration,
    mockUser,
} from '@gorgias/helpdesk-mocks'
import type { PhoneIntegration, SmsIntegration } from '@gorgias/helpdesk-types'

import { render, testAppQueryClient } from '../../../../tests/render.utils'
import { formatPhoneNumberInternational } from '../../../../utils/validation'
import { EditableMenuField } from '../EditableMenuField/EditableMenuField'
import { TriggerLabel } from '../TriggerLabel'
import { VoiceFieldMenuItems } from '../VoiceFieldMenuItems'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
})

afterAll(() => {
    server.close()
})

const MOCK_NUMBER = '+1234567890'

const mockPush = vi.fn()
const mockMakeOutboundCall = vi.fn()

const { useHistory, useCurrentUserId, useParams } = vi.hoisted(() => ({
    useHistory: vi.fn(),
    useCurrentUserId: vi.fn(),
    useParams: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useHistory,
        useParams,
    }
})

vi.mock('../../../hooks/useCurrentUserId', () => ({
    useCurrentUserId,
}))

type TestWrapperProps = {
    phoneAddress: string
    customerId: string
    customerName: string
    phoneIntegrations: PhoneIntegration[]
    smsIntegrations: SmsIntegration[]
    phoneNumbers: Record<
        number,
        { phone_number: string; phone_number_friendly: string }
    >
    isLoading: boolean
}

function TestWrapper(props: TestWrapperProps) {
    return (
        <EditableMenuField
            value={props.phoneAddress}
            onValueChange={() => {}}
            onBlur={() => {}}
            renderTrigger={(value) => (
                <TriggerLabel label={formatPhoneNumberInternational(value)} />
            )}
            name="phone"
        >
            <VoiceFieldMenuItems {...props} />
        </EditableMenuField>
    )
}

function openPhoneMenu(phoneNumber: string = MOCK_NUMBER) {
    const phoneField = screen.getByText(phoneNumber)
    act(() => {
        fireEvent.click(phoneField)
    })
}

async function waitForMakeOutboundCallVisible() {
    await waitFor(() => {
        expect(screen.getByText('Make outbound call')).toBeInTheDocument()
    })
}

async function waitForSendSmsVisible() {
    await waitFor(() => {
        expect(screen.getByText('Send SMS')).toBeInTheDocument()
    })
}

async function openMakeOutboundCallSubmenu() {
    const user = userEvent.setup()
    const submenuTrigger = screen.getByText('Make outbound call')
    await act(() => user.click(submenuTrigger))
    await waitFor(() => {
        expect(screen.getByText('Call via')).toBeInTheDocument()
    })
}

async function openSendSmsSubmenu() {
    const user = userEvent.setup()
    const submenuTrigger = screen.getByText('Send SMS')
    await act(() => user.click(submenuTrigger))
    await waitFor(() => {
        expect(screen.getByText('Send SMS via')).toBeInTheDocument()
    })
}

describe('VoiceFieldMenuItems', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        const currentUser = mockUser({
            id: 123,
            name: 'Test User',
            email: 'test@example.com',
        })
        const mockGetCurrentUser = mockGetCurrentUserHandler(async () =>
            HttpResponse.json(currentUser),
        )
        server.use(mockGetCurrentUser.handler)

        useHistory.mockReturnValue({ push: mockPush })
        useCurrentUserId.mockReturnValue({ currentUserId: 123 })
        useParams.mockReturnValue({ ticketId: '456' })
    })

    describe('when no integrations are available or loading', () => {
        it('should not render simple call MenuItem when integrations are loading', async () => {
            render(
                <TestWrapper
                    phoneAddress={MOCK_NUMBER}
                    customerId="1"
                    customerName="Test Customer"
                    phoneIntegrations={[]}
                    smsIntegrations={[]}
                    phoneNumbers={{}}
                    isLoading={true}
                />,
            )

            openPhoneMenu()

            await waitFor(() => {
                expect(screen.queryByText(/Call/)).not.toBeInTheDocument()
            })
        })

        it('should render simple call MenuItem with tel: link and openlink when clicked', async () => {
            const originalLocation = window.location
            let capturedHref = ''

            Object.defineProperty(window, 'location', {
                value: {
                    ...originalLocation,
                    set href(value: string) {
                        capturedHref = value
                    },
                    get href() {
                        return capturedHref || originalLocation.href
                    },
                },
                writable: true,
                configurable: true,
            })

            render(
                <TestWrapper
                    phoneAddress={MOCK_NUMBER}
                    customerId="1"
                    customerName="Test Customer"
                    phoneIntegrations={[]}
                    smsIntegrations={[]}
                    phoneNumbers={{}}
                    isLoading={false}
                />,
            )

            openPhoneMenu()

            const callMenuItem = await screen.findByText(/Call/)

            const user = userEvent.setup()
            await act(() => user.click(callMenuItem))

            expect(capturedHref).toBe(`tel:${MOCK_NUMBER}`)

            Object.defineProperty(window, 'location', {
                value: originalLocation,
                writable: true,
                configurable: true,
            })
        })
    })

    describe('when phone integrations are available', () => {
        const phoneIntegrations: PhoneIntegration[] = [
            mockPhoneIntegration({
                id: 1,
                name: 'Test Phone Integration',
                meta: {
                    phone_number_id: 100,
                    emoji: '📞',
                },
            }),
            mockPhoneIntegration({
                id: 2,
                name: 'Second Phone Integration',
                meta: {
                    phone_number_id: 101,
                    emoji: null,
                },
            }),
        ]

        const phoneNumbers = {
            100: {
                phone_number: '+15551234567',
                phone_number_friendly: '+1 555 123 4567',
            },
            101: {
                phone_number: '+15559876543',
                phone_number_friendly: '+1 555 987 6543',
            },
        }

        it('should render Make outbound call SubMenu and phone integration menu items', async () => {
            render(
                <TestWrapper
                    phoneAddress={MOCK_NUMBER}
                    customerId="1"
                    customerName="Test Customer"
                    phoneIntegrations={phoneIntegrations}
                    smsIntegrations={[]}
                    phoneNumbers={phoneNumbers}
                    isLoading={false}
                />,
            )

            openPhoneMenu()

            await waitForMakeOutboundCallVisible()

            await openMakeOutboundCallSubmenu()

            expect(
                screen.getByText('📞 Test Phone Integration'),
            ).toBeInTheDocument()
            expect(screen.getByText('[+1 555 123 4567]')).toBeInTheDocument()
            expect(
                screen.getByText('Second Phone Integration'),
            ).toBeInTheDocument()
            expect(screen.getByText('[+1 555 987 6543]')).toBeInTheDocument()
        })

        it('should call makeOutboundCall with correct parameters when phone integration is clicked', async () => {
            const { user } = render(
                <TestWrapper
                    phoneAddress={MOCK_NUMBER}
                    customerId="1"
                    customerName="Test Customer"
                    phoneIntegrations={phoneIntegrations}
                    smsIntegrations={[]}
                    phoneNumbers={phoneNumbers}
                    isLoading={false}
                />,
                {
                    makeOutboundCall: mockMakeOutboundCall,
                    voiceDevice: {
                        device: {},
                        call: null,
                    },
                },
            )

            openPhoneMenu()

            await waitForMakeOutboundCallVisible()

            await openMakeOutboundCallSubmenu()

            const phoneIntegrationItem = screen.getByText(
                '📞 Test Phone Integration',
            )
            await act(() => user.click(phoneIntegrationItem))

            expect(mockMakeOutboundCall).toHaveBeenCalledWith({
                fromAddress: '+15551234567',
                toAddress: MOCK_NUMBER,
                integrationId: 1,
                customerName: 'Test Customer',
                ticketId: 456,
                agentId: 123,
            })
        })

        it('should pass null as ticketId to makeOutboundCall when ticketId is "new"', async () => {
            useParams.mockReturnValue({ ticketId: 'new' })

            const phoneIntegrations = [
                mockPhoneIntegration({
                    id: 1,
                    name: 'Test Phone Integration',
                    meta: {
                        phone_number_id: 100,
                        emoji: null,
                    },
                }),
            ]

            const phoneNumbers = {
                100: {
                    phone_number: '+15551234567',
                    phone_number_friendly: '+1 555 123 4567',
                },
            }

            const { user } = render(
                <TestWrapper
                    phoneAddress={MOCK_NUMBER}
                    customerId="1"
                    customerName="Test Customer"
                    phoneIntegrations={phoneIntegrations}
                    smsIntegrations={[]}
                    phoneNumbers={phoneNumbers}
                    isLoading={false}
                />,
                {
                    makeOutboundCall: mockMakeOutboundCall,
                    voiceDevice: {
                        device: {},
                        call: null,
                    },
                },
            )

            openPhoneMenu()

            await waitForMakeOutboundCallVisible()

            await openMakeOutboundCallSubmenu()

            const phoneIntegrationItem = screen.getByText(
                'Test Phone Integration',
            )

            await act(() => user.click(phoneIntegrationItem))

            expect(mockMakeOutboundCall).toHaveBeenCalledWith(
                expect.objectContaining({
                    ticketId: null,
                }),
            )
        })

        it('should not render phone integrations when currentUserId is not a number', async () => {
            useCurrentUserId.mockReturnValue({ currentUserId: undefined })

            render(
                <TestWrapper
                    phoneAddress={MOCK_NUMBER}
                    customerId="1"
                    customerName="Test Customer"
                    phoneIntegrations={phoneIntegrations}
                    smsIntegrations={[]}
                    phoneNumbers={phoneNumbers}
                    isLoading={false}
                />,
            )

            openPhoneMenu()

            await waitFor(() => {
                expect(
                    screen.queryByText('Make outbound call'),
                ).not.toBeInTheDocument()
            })
        })

        it('should disable phone integration when voice device is not available', async () => {
            const { user } = render(
                <TestWrapper
                    phoneAddress={MOCK_NUMBER}
                    customerId="1"
                    customerName="Test Customer"
                    phoneIntegrations={phoneIntegrations}
                    smsIntegrations={[]}
                    phoneNumbers={phoneNumbers}
                    isLoading={false}
                />,
                {
                    makeOutboundCall: mockMakeOutboundCall,
                    voiceDevice: {
                        device: null,
                        call: null,
                    },
                },
            )

            openPhoneMenu()

            await waitForMakeOutboundCallVisible()

            await openMakeOutboundCallSubmenu()

            const phoneIntegrationItem = screen.getByText(
                '📞 Test Phone Integration',
            )
            await act(() => user.click(phoneIntegrationItem))

            expect(mockMakeOutboundCall).not.toHaveBeenCalled()
        })

        it('should disable phone integration when call is active', async () => {
            const { user } = render(
                <TestWrapper
                    phoneAddress={MOCK_NUMBER}
                    customerId="1"
                    customerName="Test Customer"
                    phoneIntegrations={phoneIntegrations}
                    smsIntegrations={[]}
                    phoneNumbers={phoneNumbers}
                    isLoading={false}
                />,
                {
                    makeOutboundCall: mockMakeOutboundCall,
                    voiceDevice: {
                        device: {},
                        call: { id: 'active-call' },
                    },
                },
            )

            openPhoneMenu()

            await waitForMakeOutboundCallVisible()

            await openMakeOutboundCallSubmenu()

            const phoneIntegrationItem = screen.getByText(
                '📞 Test Phone Integration',
            )
            await act(() => user.click(phoneIntegrationItem))

            expect(mockMakeOutboundCall).not.toHaveBeenCalled()
        })

        it('should not render phone integration item when phone_number_id is missing', async () => {
            const integrationWithoutPhoneNumberId: PhoneIntegration[] = [
                mockPhoneIntegration({
                    id: 1,
                    name: 'Invalid Integration',
                    meta: {
                        emoji: null,
                    },
                }),
            ]

            render(
                <TestWrapper
                    phoneAddress={MOCK_NUMBER}
                    customerId="1"
                    customerName="Test Customer"
                    phoneIntegrations={integrationWithoutPhoneNumberId}
                    smsIntegrations={[]}
                    phoneNumbers={phoneNumbers}
                    isLoading={false}
                />,
            )

            openPhoneMenu()

            await waitForMakeOutboundCallVisible()

            await openMakeOutboundCallSubmenu()

            await waitFor(() => {
                expect(
                    screen.queryByText('Invalid Integration'),
                ).not.toBeInTheDocument()
            })
        })

        it('should not render phone integration item when phone number is not found', async () => {
            render(
                <TestWrapper
                    phoneAddress={MOCK_NUMBER}
                    customerId="1"
                    customerName="Test Customer"
                    phoneIntegrations={phoneIntegrations}
                    smsIntegrations={[]}
                    phoneNumbers={{}}
                    isLoading={false}
                />,
            )

            openPhoneMenu()

            await waitForMakeOutboundCallVisible()

            await openMakeOutboundCallSubmenu()

            await waitFor(() => {
                expect(
                    screen.queryByText('📞 Test Phone Integration'),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('when SMS integrations are available', () => {
        const smsIntegrations: SmsIntegration[] = [
            mockSmsIntegration({
                id: 10,
                name: 'Test SMS Integration',
                meta: {
                    phone_number_id: 200,
                    emoji: '💬',
                },
            }),
            mockSmsIntegration({
                id: 11,
                name: 'Second SMS Integration',
                meta: {
                    phone_number_id: 201,
                    emoji: null,
                },
            }),
        ]

        const phoneNumbers = {
            200: {
                phone_number: '+15551111111',
                phone_number_friendly: '+1 555 111 1111',
            },
            201: {
                phone_number: '+15552222222',
                phone_number_friendly: '+1 555 222 2222',
            },
        }

        it('should render SMS should render Send SMS SubMenu and SMS integration menu items', async () => {
            render(
                <TestWrapper
                    phoneAddress={MOCK_NUMBER}
                    customerId="1"
                    customerName="Test Customer"
                    phoneIntegrations={[]}
                    smsIntegrations={smsIntegrations}
                    phoneNumbers={phoneNumbers}
                    isLoading={false}
                />,
            )

            openPhoneMenu()

            await waitForSendSmsVisible()

            await openSendSmsSubmenu()

            expect(
                screen.getByText('💬 Test SMS Integration'),
            ).toBeInTheDocument()
            expect(screen.getByText('[+1 555 111 1111]')).toBeInTheDocument()
            expect(
                screen.getByText('Second SMS Integration'),
            ).toBeInTheDocument()
            expect(screen.getByText('[+1 555 222 2222]')).toBeInTheDocument()
        })

        it('should navigate to new ticket page with correct state when SMS integration is clicked', async () => {
            const { user } = render(
                <TestWrapper
                    phoneAddress={MOCK_NUMBER}
                    customerId="1"
                    customerName="Test Customer"
                    phoneIntegrations={[]}
                    smsIntegrations={smsIntegrations}
                    phoneNumbers={phoneNumbers}
                    isLoading={false}
                />,
            )

            openPhoneMenu()

            await waitForSendSmsVisible()

            await openSendSmsSubmenu()

            const smsIntegrationItem = screen.getByText(
                '💬 Test SMS Integration',
            )
            await act(() => user.click(smsIntegrationItem))

            expect(mockPush).toHaveBeenCalledWith({
                pathname: '/app/ticket/new',
                search: '?customer=1',
                state: {
                    source: 'sms',
                    sender: '+15551111111',
                    receiver: {
                        name: 'Test Customer',
                        address: MOCK_NUMBER,
                    },
                    _navigationKey: expect.any(Number),
                },
            })
        })

        it('should not render SMS integration item when phone_number_id is missing', async () => {
            const integrationWithoutPhoneNumberId: SmsIntegration[] = [
                mockSmsIntegration({
                    id: 10,
                    name: 'Invalid SMS Integration',
                    meta: { emoji: null },
                }),
            ]

            render(
                <TestWrapper
                    phoneAddress={MOCK_NUMBER}
                    customerId="1"
                    customerName="Test Customer"
                    phoneIntegrations={[]}
                    smsIntegrations={integrationWithoutPhoneNumberId}
                    phoneNumbers={phoneNumbers}
                    isLoading={false}
                />,
            )

            openPhoneMenu()

            await waitForSendSmsVisible()

            await openSendSmsSubmenu()

            await waitFor(() => {
                expect(
                    screen.queryByText('Invalid SMS Integration'),
                ).not.toBeInTheDocument()
            })
        })

        it('should not render SMS integration item when phone number is not found', async () => {
            render(
                <TestWrapper
                    phoneAddress={MOCK_NUMBER}
                    customerId="1"
                    customerName="Test Customer"
                    phoneIntegrations={[]}
                    smsIntegrations={smsIntegrations}
                    phoneNumbers={{}}
                    isLoading={false}
                />,
            )

            openPhoneMenu()

            await waitForSendSmsVisible()

            await openSendSmsSubmenu()

            await waitFor(() => {
                expect(
                    screen.queryByText('💬 Test SMS Integration'),
                ).not.toBeInTheDocument()
            })
        })
    })
})
