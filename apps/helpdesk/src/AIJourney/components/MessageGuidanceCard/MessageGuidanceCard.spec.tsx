import type { ReactNode } from 'react'

import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UseFormReturn } from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'

import { FeatureFlagKey } from '@repo/feature-flags'
import { JourneyTypeEnum } from '@gorgias/convert-client'

import { MessageGuidanceCard } from './MessageGuidanceCard'
import type { MessageInstructionsVariant } from './types'

jest.mock('./MessageGuidanceFieldEditor', () => ({
    MessageGuidanceFieldEditor: ({
        value,
        label,
        description,
    }: {
        value: string
        label?: string
        description?: string
    }) => (
        <div data-mock-message-guidance-field-editor>
            {label && <div>{label}</div>}
            {description && <div>{description}</div>}
            <div>{value}</div>
        </div>
    ),
}))

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlagWithLoading: jest.fn(),
}))

jest.mock('@repo/activity-tracker/utils', () => ({
    ...jest.requireActual('@repo/activity-tracker/utils'),
    isSessionImpersonated: jest.fn(),
}))

const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock
const mockUseFlagWithLoading = require('@repo/feature-flags')
    .useFlagWithLoading as jest.Mock
const mockIsSessionImpersonated = require('@repo/activity-tracker/utils')
    .isSessionImpersonated as jest.Mock

type FormDefaults = {
    message_instructions: string
    variants: MessageInstructionsVariant[]
}

type RenderOptions = {
    defaultValues?: Partial<FormDefaults>
    methodsRef?: { current: UseFormReturn<FormDefaults> | null }
    isV3Architecture?: boolean
    onReturningCustomerChange?: (value: boolean) => void
    isFormReady?: boolean
}

const renderCard = ({
    defaultValues,
    methodsRef,
    isV3Architecture,
    onReturningCustomerChange,
    isFormReady,
}: RenderOptions = {}) => {
    const Wrapper = ({ children }: { children: ReactNode }) => {
        const methods = useForm<FormDefaults>({
            defaultValues: {
                message_instructions: '',
                variants: [],
                ...defaultValues,
            },
        })
        if (methodsRef) methodsRef.current = methods
        return <FormProvider {...methods}>{children}</FormProvider>
    }
    return render(
        <MessageGuidanceCard
            isV3Architecture={isV3Architecture}
            onReturningCustomerChange={onReturningCustomerChange}
            isFormReady={isFormReady}
        />,
        { wrapper: Wrapper },
    )
}

describe('<MessageGuidanceCard />', () => {
    const mockFlags = {
        ab: { value: false, isLoading: false },
        structured: { value: false, isLoading: false },
    }

    const setFlags = (next: {
        ab?: { value: boolean; isLoading: boolean }
        structured?: { value: boolean; isLoading: boolean }
    }) => {
        Object.assign(mockFlags, next)
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseJourneyContext.mockReturnValue({
            journeyType: JourneyTypeEnum.CartAbandoned,
            shopName: 'test-shop',
        })

        mockFlags.ab = { value: false, isLoading: false }
        mockFlags.structured = { value: false, isLoading: false }
        mockUseFlagWithLoading.mockImplementation((flagKey: string) => {
            if (
                flagKey ===
                FeatureFlagKey.AiJourneyStructuredMessageGuidanceEnabled
            ) {
                return mockFlags.structured
            }
            return mockFlags.ab
        })
        mockIsSessionImpersonated.mockReturnValue(false)
    })

    it('should render the card title and description', () => {
        renderCard()

        expect(screen.getByText('Message guidance')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Tell the AI how to write messages to your shoppers.',
            ),
        ).toBeInTheDocument()
    })

    it('should render the textarea with placeholder', () => {
        renderCard()

        expect(
            screen.getByPlaceholderText(
                'Describe tone, formatting, or what to include',
            ),
        ).toBeInTheDocument()
    })

    it('should show full remaining character count when field is empty', () => {
        renderCard()

        expect(
            screen.getByText('4000 characters remaining'),
        ).toBeInTheDocument()
    })

    it('should show reduced remaining character count when field has a value', () => {
        renderCard({ defaultValues: { message_instructions: 'Hello' } })

        expect(
            screen.getByText('3995 characters remaining'),
        ).toBeInTheDocument()
    })

    it('should show error message when the field has a validation error', () => {
        const methodsRef = {
            current: null as UseFormReturn<FormDefaults> | null,
        }
        renderCard({ methodsRef })

        act(() => {
            methodsRef.current!.setError('message_instructions', {
                message: 'Please provide message guidance to continue.',
            })
        })

        expect(
            screen.getByText('Please provide message guidance to continue.'),
        ).toBeInTheDocument()
    })

    it('should not show the returning customer toggle for non-welcome journey types', () => {
        renderCard()

        expect(screen.queryByText('Returning customer')).not.toBeInTheDocument()
    })

    it('should show the returning customer toggle for the welcome journey type', () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: { type: JourneyTypeEnum.Welcome },
        })

        renderCard()

        expect(screen.getByText('Returning customer')).toBeInTheDocument()
    })

    it('should not show the returning customer toggle when isV3Architecture is true (toggle lives in the Test configuration panel instead)', () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: { type: JourneyTypeEnum.Welcome },
        })

        renderCard({ isV3Architecture: true })

        expect(screen.queryByText('Returning customer')).not.toBeInTheDocument()
    })

    it('should toggle returning customer on and call onReturningCustomerChange with true', async () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: { type: JourneyTypeEnum.Welcome },
        })
        const onReturningCustomerChange = jest.fn()
        const user = userEvent.setup()

        renderCard({ onReturningCustomerChange })

        const toggle = await screen.findByRole('switch')
        expect(toggle).not.toBeChecked()

        await user.click(toggle)

        expect(toggle).toBeChecked()
        expect(onReturningCustomerChange).toHaveBeenCalledWith(true)
    })

    it('should toggle returning customer off and call onReturningCustomerChange with false', async () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: { type: JourneyTypeEnum.Welcome },
        })
        const onReturningCustomerChange = jest.fn()
        const user = userEvent.setup()

        renderCard({ onReturningCustomerChange })

        const toggle = await screen.findByRole('switch')

        await user.click(toggle)
        expect(onReturningCustomerChange).toHaveBeenLastCalledWith(true)

        await user.click(toggle)
        expect(onReturningCustomerChange).toHaveBeenLastCalledWith(false)
    })

    it('should not throw when onReturningCustomerChange is not provided and the toggle is clicked', async () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: { type: JourneyTypeEnum.Welcome },
        })
        const user = userEvent.setup()

        renderCard()

        const toggle = await screen.findByRole('switch')

        await user.click(toggle)

        expect(toggle).toBeChecked()
    })

    describe('A/B test toggle', () => {
        it('should hide the A/B toggle when the flag is off and the user is not impersonating', () => {
            renderCard()

            expect(
                screen.queryByText('A/B test message guidance'),
            ).not.toBeInTheDocument()
        })

        it('should hide the A/B toggle while the flag is still loading', () => {
            setFlags({ ab: { value: true, isLoading: true } })

            renderCard()

            expect(
                screen.queryByText('A/B test message guidance'),
            ).not.toBeInTheDocument()
        })

        it('should show the A/B toggle when the user is impersonating', () => {
            mockIsSessionImpersonated.mockReturnValue(true)

            renderCard()

            expect(
                screen.getByText('A/B test message guidance'),
            ).toBeInTheDocument()
        })

        it('should show the A/B toggle when the flag is enabled', () => {
            setFlags({ ab: { value: true, isLoading: false } })

            renderCard()

            expect(
                screen.getByText('A/B test message guidance'),
            ).toBeInTheDocument()
        })

        it('should default the A/B toggle to off when no variants are present', () => {
            mockIsSessionImpersonated.mockReturnValue(true)

            renderCard()

            const toggle = screen.getByRole('switch', { name: /a\/b test/i })
            expect(toggle).not.toBeChecked()
        })

        it('should default the A/B toggle to on when variants are present', () => {
            mockIsSessionImpersonated.mockReturnValue(true)

            renderCard({
                defaultValues: {
                    variants: [
                        { id: 'v1', message_instructions: 'copy', weight: 30 },
                    ],
                },
            })

            const toggle = screen.getByRole('switch', { name: /a\/b test/i })
            expect(toggle).toBeChecked()
        })

        it('should append a 50% variant when the A/B toggle is enabled', async () => {
            mockIsSessionImpersonated.mockReturnValue(true)
            const user = userEvent.setup()

            renderCard()

            await user.click(screen.getByRole('switch', { name: /a\/b test/i }))

            expect(screen.getByText(/Variant 1 · 50%/)).toBeInTheDocument()
            expect(screen.getByText(/Control · 50%/)).toBeInTheDocument()
        })

        it('should replace variants with an empty array when the A/B toggle is disabled', async () => {
            mockIsSessionImpersonated.mockReturnValue(true)
            const user = userEvent.setup()

            renderCard({
                defaultValues: {
                    variants: [
                        { id: 'v1', message_instructions: 'copy', weight: 20 },
                    ],
                },
            })

            await user.click(screen.getByRole('switch', { name: /a\/b test/i }))

            expect(screen.queryByText(/Variant 1/)).not.toBeInTheDocument()
            expect(screen.queryByText(/Control/)).not.toBeInTheDocument()
        })
    })

    describe('Structured guidance editor (FF on)', () => {
        beforeEach(() => {
            setFlags({ structured: { value: true, isLoading: false } })
        })

        it('renders the structured editor in place of the legacy textarea on the control field', () => {
            const { container } = renderCard({
                isV3Architecture: true,
                defaultValues: { message_instructions: '<p>hello</p>' },
            })

            expect(
                container.querySelector(
                    '[data-mock-message-guidance-field-editor]',
                ),
            ).not.toBeNull()
            expect(
                screen.queryByPlaceholderText(
                    'Describe tone, formatting, or what to include',
                ),
            ).not.toBeInTheDocument()
        })

        it('still uses the legacy textarea when the structured editor flag is off', () => {
            setFlags({ structured: { value: false, isLoading: false } })

            const { container } = renderCard()

            expect(
                container.querySelector(
                    '[data-mock-message-guidance-field-editor]',
                ),
            ).toBeNull()
            expect(
                screen.getByPlaceholderText(
                    'Describe tone, formatting, or what to include',
                ),
            ).toBeInTheDocument()
        })

        it('passes the campaign-specific description to the editor for campaigns', () => {
            mockUseJourneyContext.mockReturnValue({
                journeyType: 'campaign',
                shopName: 'test-shop',
            })

            renderCard({ isV3Architecture: true })

            expect(screen.getByText('Instructions')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Describe campaign context, objective, and boundaries in clear, specific phrases.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Message guidance'),
            ).not.toBeInTheDocument()
        })

        it('passes the flow-specific description to the editor for flows', () => {
            mockUseJourneyContext.mockReturnValue({
                journeyType: 'cart-abandoned',
                shopName: 'test-shop',
            })

            renderCard({ isV3Architecture: true })

            expect(
                screen.getByText(
                    'Describe flow context, objective, and boundaries in clear, specific phrases.',
                ),
            ).toBeInTheDocument()
        })

        it('keeps the A/B test toggle visible when the user is impersonating, below the description', () => {
            mockIsSessionImpersonated.mockReturnValue(true)

            renderCard({ isV3Architecture: true })

            expect(
                screen.getByText('A/B test message guidance'),
            ).toBeInTheDocument()
        })
    })
})
