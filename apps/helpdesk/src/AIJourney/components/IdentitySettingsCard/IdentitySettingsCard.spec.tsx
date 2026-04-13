import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { useAiJourneyPhoneList } from 'AIJourney/hooks'
import { useJourneyContext } from 'AIJourney/providers'

import { IdentitySettingsCard } from './IdentitySettingsCard'

jest.mock('AIJourney/providers', () => ({
    useJourneyContext: jest.fn(),
}))

jest.mock(
    'AIJourney/hooks/useAiJourneyPhoneList/useAiJourneyPhoneList',
    () => ({
        useAiJourneyPhoneList: jest.fn(),
    }),
)

beforeAll(() => {
    HTMLElement.prototype.getAnimations = jest.fn().mockReturnValue([])
})

const mockUseJourneyContext = useJourneyContext as jest.Mock
const mockUseAiJourneyPhoneList = useAiJourneyPhoneList as jest.Mock

type SmsSender = {
    sms_sender_integration_id: number | null
    sms_sender_number: string | null
}

type FormValues = {
    sms_sender: SmsSender
    brand_name: string
}

const renderComponent = (defaultValues: Partial<FormValues> = {}) => {
    const Wrapper = () => {
        const methods = useForm<FormValues>({
            defaultValues: {
                sms_sender: {
                    sms_sender_integration_id: null,
                    sms_sender_number: null,
                },
                brand_name: '',
                ...defaultValues,
            },
        })
        return (
            <FormProvider {...methods}>
                <IdentitySettingsCard isFormReady />
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<IdentitySettingsCard />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseJourneyContext.mockReturnValue({
            storeConfiguration: {
                monitoredSmsIntegrations: [],
            },
        })
        mockUseAiJourneyPhoneList.mockReturnValue({
            marketingCapabilityPhoneNumbers: [],
        })
    })

    describe('loading state', () => {
        it('should render a skeleton when isFormReady is false', () => {
            const Wrapper = () => {
                const methods = useForm()
                return (
                    <FormProvider {...methods}>
                        <IdentitySettingsCard isFormReady={false} />
                    </FormProvider>
                )
            }
            render(<Wrapper />)

            expect(screen.getByLabelText('Loading')).toBeInTheDocument()
            expect(
                screen.queryByText('Identity settings'),
            ).not.toBeInTheDocument()
        })
    })

    describe('rendering', () => {
        it('should render the "Identity settings" heading', () => {
            renderComponent()

            expect(screen.getByText('Identity settings')).toBeInTheDocument()
        })

        it('should render the "Brand name" text field', () => {
            renderComponent()

            expect(screen.getByLabelText('Brand name')).toBeInTheDocument()
        })

        it('should render the brand name field caption', () => {
            renderComponent()

            expect(
                screen.getByText(
                    'Shoppers will see this name as part of the greeting.',
                ),
            ).toBeInTheDocument()
        })

        it('should render the "Send SMS from" selector', () => {
            renderComponent()

            expect(screen.getByText('Send SMS from')).toBeInTheDocument()
        })
    })

    describe('form values', () => {
        it('should display a pre-filled brand name when provided', () => {
            renderComponent({ brand_name: 'Acme Corp' })

            expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument()
        })

        it('should update the brand name input when the user types', async () => {
            const user = userEvent.setup()
            renderComponent()

            const input = screen.getByLabelText('Brand name')
            await user.type(input, 'New Brand')

            expect(input).toHaveValue('New Brand')
        })
    })

    describe('integration context', () => {
        it('should pass monitoredSmsIntegrations from context to SmsSenderSelect', () => {
            const monitoredSmsIntegrations = [101, 102]
            mockUseJourneyContext.mockReturnValue({
                storeConfiguration: { monitoredSmsIntegrations },
            })

            renderComponent()

            expect(mockUseAiJourneyPhoneList).toHaveBeenCalledWith(
                monitoredSmsIntegrations,
            )
        })

        it('should pass an empty array when storeConfiguration has no monitoredSmsIntegrations', () => {
            mockUseJourneyContext.mockReturnValue({
                storeConfiguration: null,
            })

            renderComponent()

            expect(mockUseAiJourneyPhoneList).toHaveBeenCalledWith([])
        })
    })
})
