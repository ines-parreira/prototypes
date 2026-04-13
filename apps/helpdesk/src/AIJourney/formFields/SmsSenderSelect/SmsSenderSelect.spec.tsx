import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { useAiJourneyPhoneList } from 'AIJourney/hooks'
import type { NewPhoneNumber } from 'models/phoneNumber/types'
import { getCountryFromPhoneNumber } from 'pages/phoneNumbers/utils'

import { SmsSenderSelect } from './SmsSenderSelect'

jest.mock(
    'AIJourney/hooks/useAiJourneyPhoneList/useAiJourneyPhoneList',
    () => ({
        useAiJourneyPhoneList: jest.fn(),
    }),
)

jest.mock('pages/phoneNumbers/utils', () => ({
    getCountryFromPhoneNumber: jest.fn(),
}))

const mockGetCountryFromPhoneNumber = getCountryFromPhoneNumber as jest.Mock

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

const MONITORED_SMS_INTEGRATIONS = [101, 102]

beforeAll(() => {
    HTMLElement.prototype.getAnimations = jest.fn().mockReturnValue([])
})

type SmsSender = {
    sms_sender_integration_id: number | null
    sms_sender_number: string | null
}

type FormValues = {
    sms_sender: SmsSender
}

const renderComponent = (defaultValues: Partial<FormValues> = {}) => {
    const Wrapper = () => {
        const methods = useForm<FormValues>({
            defaultValues: {
                sms_sender: {
                    sms_sender_integration_id: null,
                    sms_sender_number: null,
                },
                ...defaultValues,
            },
        })
        return (
            <FormProvider {...methods}>
                <SmsSenderSelect
                    monitoredSmsIntegrations={MONITORED_SMS_INTEGRATIONS}
                />
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<SmsSenderSelect />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockGetCountryFromPhoneNumber.mockReturnValue(undefined)
        mockUseAiJourneyPhoneList.mockReturnValue({
            marketingCapabilityPhoneNumbers: phoneNumbers,
        })
    })

    describe('rendering', () => {
        it('should render the "Send SMS from" label', () => {
            renderComponent()

            expect(screen.getByText('Send SMS from')).toBeInTheDocument()
        })

        it('should render the caption', () => {
            renderComponent()

            expect(
                screen.getByText('Shoppers will see this as the sender.'),
            ).toBeInTheDocument()
        })

        it('should render the select trigger', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /send sms from/i }),
            ).toBeInTheDocument()
        })

        it('should render all phone number options in the dropdown', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /send sms from/i }),
                )
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('option', { name: /\[MKT\] Phone 1/i }),
                ).toBeInTheDocument()
                expect(
                    screen.getByRole('option', { name: /\[MKT\] Phone 2/i }),
                ).toBeInTheDocument()
            })
        })

        it('should render phone numbers with their friendly number as caption', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /send sms from/i }),
                )
            })

            await waitFor(() => {
                expect(
                    screen.getByText('+1 (555) 000-0001'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('+1 (555) 000-0002'),
                ).toBeInTheDocument()
            })
        })

        it('should render with empty dropdown when no phone numbers are available', async () => {
            mockUseAiJourneyPhoneList.mockReturnValue({
                marketingCapabilityPhoneNumbers: [],
            })

            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /send sms from/i }),
                )
            })

            await waitFor(() => {
                expect(
                    screen.queryByRole('option', { name: /\[MKT\] Phone/i }),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('value display', () => {
        it('should display the channel name matching the sms integration id', () => {
            renderComponent({
                sms_sender: {
                    sms_sender_integration_id: 101,
                    sms_sender_number: '+15550001',
                },
            })

            const trigger = screen.getByRole('button', {
                name: /send sms from/i,
            })
            expect(
                within(trigger).getByDisplayValue(/\[MKT\] Phone 1/),
            ).toBeInTheDocument()
        })

        it('should display a different channel when a different integration id is selected', () => {
            renderComponent({
                sms_sender: {
                    sms_sender_integration_id: 102,
                    sms_sender_number: '+15550002',
                },
            })

            const trigger = screen.getByRole('button', {
                name: /send sms from/i,
            })
            expect(
                within(trigger).getByDisplayValue(/\[MKT\] Phone 2/),
            ).toBeInTheDocument()
        })

        it('should not show a channel as selected when no matching integration is found', () => {
            renderComponent({
                sms_sender: {
                    sms_sender_integration_id: 999,
                    sms_sender_number: null,
                },
            })

            const trigger = screen.getByRole('button', {
                name: /send sms from/i,
            })
            expect(
                within(trigger).queryByDisplayValue(/\[MKT\] Phone/),
            ).not.toBeInTheDocument()
        })
    })

    describe('user interaction', () => {
        it('should update the selected channel when a phone number is picked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /send sms from/i }),
                )
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('option', { name: /\[MKT\] Phone 1/i }),
                ).toBeInTheDocument()
            })

            await act(async () => {
                await user.click(
                    screen.getByRole('option', { name: /\[MKT\] Phone 1/i }),
                )
            })

            const trigger = screen.getByRole('button', {
                name: /send sms from/i,
            })
            await waitFor(() => {
                expect(
                    within(trigger).getByDisplayValue(/\[MKT\] Phone 1/),
                ).toBeInTheDocument()
            })
        })
    })

    describe('integration context', () => {
        it('should pass monitoredSmsIntegrations to the phone list hook', () => {
            renderComponent()

            expect(mockUseAiJourneyPhoneList).toHaveBeenCalledWith(
                MONITORED_SMS_INTEGRATIONS,
            )
        })

        it('should pass an empty array to the hook when no integrations are monitored', () => {
            const Wrapper = () => {
                const methods = useForm()
                return (
                    <FormProvider {...methods}>
                        <SmsSenderSelect monitoredSmsIntegrations={[]} />
                    </FormProvider>
                )
            }
            render(<Wrapper />)

            expect(mockUseAiJourneyPhoneList).toHaveBeenCalledWith([])
        })
    })

    describe('flag icons', () => {
        it('should render a flag icon in the trigger when the selected phone has a country code', () => {
            mockGetCountryFromPhoneNumber.mockReturnValue('US')

            renderComponent({
                sms_sender: {
                    sms_sender_integration_id: 101,
                    sms_sender_number: '+15550001',
                },
            })

            const trigger = screen.getByRole('button', {
                name: /send sms from/i,
            })
            expect(trigger).toBeInTheDocument()
        })

        it('should render flag icons in dropdown options when phone numbers have country codes', async () => {
            mockGetCountryFromPhoneNumber.mockReturnValue('US')
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /send sms from/i }),
                )
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('option', { name: /\[MKT\] Phone 1/i }),
                ).toBeInTheDocument()
                expect(
                    screen.getByRole('option', { name: /\[MKT\] Phone 2/i }),
                ).toBeInTheDocument()
            })
        })

        it('should not render flag icons when phone numbers have no country code', async () => {
            mockGetCountryFromPhoneNumber.mockReturnValue(undefined)
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /send sms from/i }),
                )
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('option', { name: /\[MKT\] Phone 1/i }),
                ).toBeInTheDocument()
            })
        })
    })
})
