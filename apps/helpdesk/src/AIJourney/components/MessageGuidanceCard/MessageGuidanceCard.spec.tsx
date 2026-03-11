import { act, render, screen } from '@testing-library/react'
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

describe('<MessageGuidanceCard />', () => {
    const mockOnChange = jest.fn()
    const mockOnReturningCustomerChange = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseJourneyContext.mockReturnValue({
            journeyType: JourneyTypeEnum.CartAbandoned,
        })

        mockUseController.mockReturnValue({
            field: { value: '', onChange: mockOnChange },
            fieldState: { error: undefined },
        })
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
})
