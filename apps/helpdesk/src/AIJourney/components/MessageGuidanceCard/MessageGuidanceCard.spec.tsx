import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { JourneyTypeEnum } from '@gorgias/convert-client'

import { MessageGuidanceCard } from './MessageGuidanceCard'

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

jest.mock('react-hook-form', () => ({
    ...jest.requireActual('react-hook-form'),
    useController: jest.fn(),
}))

const mockUseController = require('react-hook-form').useController as jest.Mock

jest.mock('@repo/forms', () => ({
    ...jest.requireActual('@repo/forms'),
    useFieldArray: jest.fn(),
    useFormContext: jest.fn(),
    useWatch: jest.fn(),
}))

const mockUseFieldArray = require('@repo/forms').useFieldArray as jest.Mock
const mockUseFormContext = require('@repo/forms').useFormContext as jest.Mock
const mockUseWatch = require('@repo/forms').useWatch as jest.Mock

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlagWithLoading: jest.fn(),
}))

const mockUseFlagWithLoading = require('@repo/feature-flags')
    .useFlagWithLoading as jest.Mock

jest.mock('@repo/activity-tracker/utils', () => ({
    ...jest.requireActual('@repo/activity-tracker/utils'),
    isSessionImpersonated: jest.fn(),
}))

const mockIsSessionImpersonated = require('@repo/activity-tracker/utils')
    .isSessionImpersonated as jest.Mock

describe('<MessageGuidanceCard />', () => {
    const mockOnChange = jest.fn()
    const mockOnReturningCustomerChange = jest.fn()
    const mockAppend = jest.fn()
    const mockRemove = jest.fn()
    const mockReplace = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseJourneyContext.mockReturnValue({
            journeyType: JourneyTypeEnum.CartAbandoned,
        })

        mockUseController.mockReturnValue({
            field: { value: '', onChange: mockOnChange },
            fieldState: { error: undefined },
        })

        mockUseFieldArray.mockReturnValue({
            fields: [],
            append: mockAppend,
            remove: mockRemove,
            replace: mockReplace,
        })
        mockUseFormContext.mockReturnValue({ control: {} })
        mockUseWatch.mockReturnValue([])
        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })
        mockIsSessionImpersonated.mockReturnValue(false)
    })

    it('should render the card title and description', () => {
        render(<MessageGuidanceCard />)

        expect(screen.getByText('Message guidance')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Tell the AI how to write messages to your shoppers.',
            ),
        ).toBeInTheDocument()
    })

    it('should render the textarea with placeholder', () => {
        render(<MessageGuidanceCard />)

        expect(
            screen.getByPlaceholderText(
                'Describe tone, formatting, or what to include',
            ),
        ).toBeInTheDocument()
    })

    it('should show full remaining character count when field is empty', () => {
        render(<MessageGuidanceCard />)

        expect(
            screen.getByText('4000 characters remaining'),
        ).toBeInTheDocument()
    })

    it('should show reduced remaining character count when field has a value', () => {
        mockUseController.mockReturnValue({
            field: { value: 'Hello', onChange: mockOnChange },
            fieldState: { error: undefined },
        })

        render(<MessageGuidanceCard />)

        expect(
            screen.getByText('3995 characters remaining'),
        ).toBeInTheDocument()
    })

    it('should show error message when the field has a validation error', () => {
        mockUseController.mockReturnValue({
            field: { value: '', onChange: mockOnChange },
            fieldState: {
                error: {
                    message: 'Please provide message guidance to continue.',
                },
            },
        })

        render(<MessageGuidanceCard />)

        expect(
            screen.getByText('Please provide message guidance to continue.'),
        ).toBeInTheDocument()
    })

    it('should not show the returning customer toggle for non-welcome journey types', () => {
        render(<MessageGuidanceCard />)

        expect(screen.queryByText('Returning customer')).not.toBeInTheDocument()
    })

    it('should show the returning customer toggle for the welcome journey type', () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: {
                type: JourneyTypeEnum.Welcome,
            },
        })

        render(<MessageGuidanceCard />)

        expect(screen.getByText('Returning customer')).toBeInTheDocument()
    })

    it('should toggle returning customer on and call onReturningCustomerChange with true', async () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: {
                type: JourneyTypeEnum.Welcome,
            },
        })

        const user = userEvent.setup()
        render(
            <MessageGuidanceCard
                onReturningCustomerChange={mockOnReturningCustomerChange}
            />,
        )

        const toggle = await screen.findByRole('switch')
        expect(toggle).not.toBeChecked()

        await act(async () => {
            await user.click(toggle)
        })

        expect(toggle).toBeChecked()
        expect(mockOnReturningCustomerChange).toHaveBeenCalledWith(true)
    })

    it('should toggle returning customer off and call onReturningCustomerChange with false', async () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: {
                type: JourneyTypeEnum.Welcome,
            },
        })

        const user = userEvent.setup()
        render(
            <MessageGuidanceCard
                onReturningCustomerChange={mockOnReturningCustomerChange}
            />,
        )

        const toggle = await screen.findByRole('switch')

        await act(async () => {
            await user.click(toggle)
        })
        expect(mockOnReturningCustomerChange).toHaveBeenCalledWith(true)

        await act(async () => {
            await user.click(toggle)
        })
        expect(mockOnReturningCustomerChange).toHaveBeenCalledWith(false)
    })

    it('should not throw when onReturningCustomerChange is not provided and the toggle is clicked', async () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: {
                type: JourneyTypeEnum.Welcome,
            },
        })

        const user = userEvent.setup()
        render(<MessageGuidanceCard />)

        const toggle = await screen.findByRole('switch')

        await act(async () => {
            await user.click(toggle)
        })

        expect(toggle).toHaveAttribute('data-react-aria-pressable', 'true')
    })

    describe('A/B test toggle', () => {
        it('should hide the A/B toggle when the flag is off and the user is not impersonating', () => {
            render(<MessageGuidanceCard />)

            expect(
                screen.queryByText('A/B test message guidance'),
            ).not.toBeInTheDocument()
        })

        it('should hide the A/B toggle while the flag is still loading', () => {
            mockUseFlagWithLoading.mockReturnValue({
                value: true,
                isLoading: true,
            })
            mockIsSessionImpersonated.mockReturnValue(false)

            render(<MessageGuidanceCard />)

            expect(
                screen.queryByText('A/B test message guidance'),
            ).not.toBeInTheDocument()
        })

        it('should show the A/B toggle when the user is impersonating', () => {
            mockIsSessionImpersonated.mockReturnValue(true)

            render(<MessageGuidanceCard />)

            expect(
                screen.getByText('A/B test message guidance'),
            ).toBeInTheDocument()
        })

        it('should show the A/B toggle when the flag is enabled', () => {
            mockUseFlagWithLoading.mockReturnValue({
                value: true,
                isLoading: false,
            })

            render(<MessageGuidanceCard />)

            expect(
                screen.getByText('A/B test message guidance'),
            ).toBeInTheDocument()
        })

        it('should default the A/B toggle to off when no variants are present', () => {
            mockIsSessionImpersonated.mockReturnValue(true)

            render(<MessageGuidanceCard />)

            const toggle = screen.getByRole('switch', {
                name: /a\/b test/i,
            })
            expect(toggle).not.toBeChecked()
        })

        it('should default the A/B toggle to on when variants are present', () => {
            mockIsSessionImpersonated.mockReturnValue(true)
            mockUseWatch.mockReturnValue([
                { id: 'v1', message_instructions: 'copy', weight: 30 },
            ])

            render(<MessageGuidanceCard />)

            const toggle = screen.getByRole('switch', {
                name: /a\/b test/i,
            })
            expect(toggle).toBeChecked()
        })

        it('should append a 50% variant when the A/B toggle is enabled', async () => {
            mockIsSessionImpersonated.mockReturnValue(true)
            const user = userEvent.setup()

            render(<MessageGuidanceCard />)

            const toggle = screen.getByRole('switch', {
                name: /a\/b test/i,
            })

            await act(async () => {
                await user.click(toggle)
            })

            expect(mockAppend).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: expect.any(String),
                    message_instructions: '',
                    weight: 50,
                }),
            )
            expect(mockReplace).not.toHaveBeenCalled()
        })

        it('should replace variants with an empty array when the A/B toggle is disabled', async () => {
            mockIsSessionImpersonated.mockReturnValue(true)
            mockUseWatch.mockReturnValue([
                { id: 'v1', message_instructions: 'copy', weight: 20 },
            ])
            const user = userEvent.setup()

            render(<MessageGuidanceCard />)

            const toggle = screen.getByRole('switch', {
                name: /a\/b test/i,
            })

            await act(async () => {
                await user.click(toggle)
            })

            expect(mockReplace).toHaveBeenCalledWith([])
            expect(mockAppend).not.toHaveBeenCalled()
        })
    })
})
