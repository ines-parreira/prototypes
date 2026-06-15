import { render } from '@repo/testing'
import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'

import { useAiJourneyPhoneList } from 'AIJourney/hooks'
import { useJourneyContext } from 'AIJourney/providers'
import type { NewPhoneNumber } from 'models/phoneNumber/types'
import { getCountryFromPhoneNumber } from 'pages/phoneNumbers/utils'

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

jest.mock('pages/phoneNumbers/utils', () => ({
    getCountryFromPhoneNumber: jest.fn(),
}))

const mockUseJourneyContext = useJourneyContext as jest.Mock
const mockUseAiJourneyPhoneList = useAiJourneyPhoneList as jest.Mock
const mockGetCountryFromPhoneNumber = getCountryFromPhoneNumber as jest.Mock

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
        mockGetCountryFromPhoneNumber.mockReturnValue(undefined)

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

        it('should render each option with the integration name and friendly number as caption', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /send from/i }),
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

            expect(screen.getByText('+1 (555) 000-0001')).toBeInTheDocument()
            expect(screen.getByText('+1 (555) 000-0002')).toBeInTheDocument()
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
                    screen.queryByRole('option', { name: /\[MKT\] Phone/i }),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('value display', () => {
        it('should display the integration name matching the sms integration id', () => {
            renderComponent({
                sms_sender_integration_id: { id: 101, label: '+15550001' },
            })

            const trigger = screen.getByRole('button', { name: /send from/i })
            expect(
                within(trigger).getByDisplayValue(/\[MKT\] Phone 1/),
            ).toBeInTheDocument()
        })

        it('should display a different integration name when a different id is selected', () => {
            renderComponent({
                sms_sender_integration_id: { id: 102, label: '+15550002' },
            })

            const trigger = screen.getByRole('button', { name: /send from/i })
            expect(
                within(trigger).getByDisplayValue(/\[MKT\] Phone 2/),
            ).toBeInTheDocument()
        })

        it('should not show an integration as selected when no matching integration is found', () => {
            renderComponent({
                sms_sender_integration_id: { id: 999, label: null },
            })

            const trigger = screen.getByRole('button', { name: /send from/i })
            expect(
                within(trigger).queryByDisplayValue(/\[MKT\] Phone/),
            ).not.toBeInTheDocument()
        })
    })

    describe('user interaction', () => {
        it('should display the integration name and write the selected option when an item is picked', async () => {
            let methodsRef: UseFormReturn | undefined
            const Wrapper = () => {
                const methods = useForm()
                methodsRef = methods
                return (
                    <FormProvider {...methods}>
                        <SenderPhoneNumber />
                    </FormProvider>
                )
            }
            render(<Wrapper />)

            const user = userEvent.setup()
            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /send from/i }),
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

            const trigger = screen.getByRole('button', { name: /send from/i })
            await waitFor(() => {
                expect(
                    within(trigger).getByDisplayValue(/\[MKT\] Phone 1/),
                ).toBeInTheDocument()
            })

            expect(methodsRef!.getValues('sms_sender_integration_id')).toEqual({
                id: 101,
                label: '+15550001',
            })
        })
    })

    describe('multi-integration phone numbers (AIJ-2091)', () => {
        const multiIntegrationPhone = {
            id: 824,
            name: '[MKT] AI Journey',
            phone_number: '+61489273833',
            phone_number_friendly: '+61 489 273 833',
            capabilities: {
                sms: true,
                mms: true,
                voice: true,
                whatsapp: true,
            },
            integrations: [
                { id: 61722, name: 'Outbound Support', type: 'phone' },
                { id: 72476, name: '[MKT] AI Journey - SMS', type: 'sms' },
            ],
            connections: [],
            created_datetime: '2024-01-01T00:00:00Z',
            updated_datetime: '2024-01-01T00:00:00Z',
            deleted_datetime: null,
        } as unknown as NewPhoneNumber

        beforeEach(() => {
            mockUseJourneyContext.mockReturnValue({
                storeConfiguration: { monitoredSmsIntegrations: [72476] },
            })
            mockUseAiJourneyPhoneList.mockReturnValue({
                marketingCapabilityPhoneNumbers: [multiIntegrationPhone],
            })
        })

        it('writes the SMS integration id (not the phone integration id) when the user picks a multi-integration phone number', async () => {
            let methodsRef: UseFormReturn | undefined
            const Wrapper = () => {
                const methods = useForm()
                methodsRef = methods
                return (
                    <FormProvider {...methods}>
                        <SenderPhoneNumber />
                    </FormProvider>
                )
            }
            render(<Wrapper />)

            const user = userEvent.setup()
            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /send from/i }),
                )
            })
            await waitFor(() => {
                expect(
                    screen.getByRole('option', {
                        name: /\[MKT\] AI Journey/i,
                    }),
                ).toBeInTheDocument()
            })
            await act(async () => {
                await user.click(
                    screen.getByRole('option', {
                        name: /\[MKT\] AI Journey/i,
                    }),
                )
            })

            await waitFor(() => {
                const value = methodsRef!.getValues('sms_sender_integration_id')
                expect(value).toEqual({
                    id: 72476,
                    label: '+61489273833',
                })
            })
        })

        it('displays the integration name when the form is preloaded with the SMS integration id of a multi-integration phone', () => {
            renderComponent({
                sms_sender_integration_id: { id: 72476, label: '+61489273833' },
            })

            const trigger = screen.getByRole('button', { name: /send from/i })
            expect(
                within(trigger).getByDisplayValue(/\[MKT\] AI Journey/),
            ).toBeInTheDocument()
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
