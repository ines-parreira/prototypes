import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { useAiJourneyPhoneList } from 'AIJourney/hooks'
import { useJourneyContext } from 'AIJourney/providers'
import type { NewPhoneNumber } from 'models/phoneNumber/types'

import { SenderPhoneNumber } from './SenderPhoneNumber'

jest.mock('AIJourney/providers', () => ({
    useJourneyContext: jest.fn(),
}))

jest.mock(
    'AIJourney/hooks/useAiJourneyPhoneList/useAiJourneyPhoneList',
    () => ({
        useAiJourneyPhoneList: jest.fn(),
    }),
)

const mockUseJourneyContext = useJourneyContext as jest.Mock
const mockUseAiJourneyPhoneList = useAiJourneyPhoneList as jest.Mock

const makePhoneNumber = (
    id: number,
    integrationId: number,
    friendlyNumber: string,
): NewPhoneNumber =>
    ({
        id,
        name: `[MKT] Phone ${id}`,
        phone_number: `+1555000${id}`,
        phone_number_friendly: friendlyNumber,
        capabilities: { sms: true, mms: false, voice: false, whatsapp: false },
        integrations: [{ id: integrationId, type: 'sms', name: `sms-${id}` }],
        connections: [],
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-01T00:00:00Z',
        deleted_datetime: null,
    }) as unknown as NewPhoneNumber

const phoneNumbers = [
    makePhoneNumber(1, 101, '+1 (555) 000-0001'),
    makePhoneNumber(2, 102, '+1 (555) 000-0002'),
]

beforeAll(() => {
    HTMLElement.prototype.getAnimations = jest.fn().mockReturnValue([])
})

const renderComponent = (defaultValues: Record<string, unknown> = {}) => {
    const Wrapper = () => {
        const methods = useForm({ defaultValues })
        return (
            <FormProvider {...methods}>
                <SenderPhoneNumber />
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<SenderPhoneNumber />', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseJourneyContext.mockReturnValue({
            storeConfiguration: {
                monitoredSmsIntegrations: [101, 102],
            },
        })

        mockUseAiJourneyPhoneList.mockReturnValue({
            marketingCapabilityPhoneNumbers: phoneNumbers,
        })
    })

    describe('rendering', () => {
        it('should render the "Send from" label', () => {
            renderComponent()

            expect(screen.getByText('Send from')).toBeInTheDocument()
        })

        it('should render the caption', () => {
            renderComponent()

            expect(
                screen.getByText('Shoppers will see this as the sender'),
            ).toBeInTheDocument()
        })

        it('should render the select trigger', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /send from/i }),
            ).toBeInTheDocument()
        })

        it('should render all phone number options', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /send from/i }),
                )
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('option', {
                        name: /\+1 \(555\) 000-0001/i,
                    }),
                ).toBeInTheDocument()
                expect(
                    screen.getByRole('option', {
                        name: /\+1 \(555\) 000-0002/i,
                    }),
                ).toBeInTheDocument()
            })
        })

        it('should render with empty options when no phone numbers are available', async () => {
            mockUseAiJourneyPhoneList.mockReturnValue({
                marketingCapabilityPhoneNumbers: [],
            })

            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /send from/i }),
                )
            })

            await waitFor(() => {
                expect(
                    screen.queryByRole('option', {
                        name: /\+1 \(555\) 000-0001/i,
                    }),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('value display', () => {
        it('should display the selected phone number matching the sms integration id', () => {
            renderComponent({ sms_sender_integration_id: 101 })

            expect(screen.getByText('+1 (555) 000-0001')).toBeInTheDocument()
        })

        it('should display a different phone number when a different id is selected', () => {
            renderComponent({ sms_sender_integration_id: 102 })

            expect(screen.getByText('+1 (555) 000-0002')).toBeInTheDocument()
        })

        it('should not show a phone number as selected when no matching integration is found', () => {
            renderComponent({ sms_sender_integration_id: 999 })

            const trigger = screen.getByRole('button', { name: /send from/i })
            expect(trigger).not.toHaveTextContent('+1 (555) 000-0001')
            expect(trigger).not.toHaveTextContent('+1 (555) 000-0002')
        })
    })

    describe('user interaction', () => {
        it('should call onChange with the selected phone number option when an item is picked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /send from/i }),
                )
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('option', {
                        name: /\+1 \(555\) 000-0001/i,
                    }),
                ).toBeInTheDocument()
            })

            await act(async () => {
                await user.click(
                    screen.getByRole('option', {
                        name: /\+1 \(555\) 000-0001/i,
                    }),
                )
            })

            await waitFor(() => {
                expect(
                    screen.getByText('+1 (555) 000-0001'),
                ).toBeInTheDocument()
            })
        })
    })

    describe('integration context', () => {
        it('should pass monitoredSmsIntegrations to the hook', () => {
            mockUseJourneyContext.mockReturnValue({
                storeConfiguration: {
                    monitoredSmsIntegrations: [201, 202],
                },
            })

            renderComponent()

            expect(mockUseAiJourneyPhoneList).toHaveBeenCalledWith([201, 202])
        })

        it('should pass an empty array when storeConfiguration is undefined', () => {
            mockUseJourneyContext.mockReturnValue({
                storeConfiguration: undefined,
            })

            renderComponent()

            expect(mockUseAiJourneyPhoneList).toHaveBeenCalledWith([])
        })

        it('should pass an empty array when monitoredSmsIntegrations is absent', () => {
            mockUseJourneyContext.mockReturnValue({
                storeConfiguration: {},
            })

            renderComponent()

            expect(mockUseAiJourneyPhoneList).toHaveBeenCalledWith([])
        })
    })
})
