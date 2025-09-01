import { act, fireEvent, render, waitFor } from '@testing-library/react'

import useAppDispatch from 'hooks/useAppDispatch'
import { NotificationStatus } from 'state/notifications/types'

import { allProducts } from '../../tests/data'
import { ProductRecommendationRuleType } from '../../types'
import { SelectedItemsDrawer } from '../SelectedItemsDrawer'

jest.mock('hooks/useAppDispatch', () => jest.fn())
const dispatchMock = jest.fn()
;(useAppDispatch as jest.Mock).mockReturnValue(dispatchMock)

jest.mock('state/notifications/actions', () => ({
    notify: (value: any) => value,
}))

const mockOnSubmit = jest.fn().mockResolvedValue(undefined)
const mockOnClose = jest.fn()

const renderComponent = (
    options: {
        title?: string
        itemLabelPlural?: string
        ruleType?: ProductRecommendationRuleType
        items?: Array<{
            id: string
            title: string
            img?: string
        }>
        isOpen?: boolean
        hasImages?: boolean
    } = {},
) => {
    const {
        title = 'All products',
        itemLabelPlural = 'products',
        ruleType = 'product',
        items = allProducts
            .filter((product) =>
                [4, 9, 14, 18, 22, 23, 27, 30].includes(product.id),
            )
            .map((product) => ({
                id: product.id.toString(),
                title: product.title,
                img: product.image?.src,
            })),
        isOpen = true,
        hasImages = true,
    } = options

    return render(
        <SelectedItemsDrawer
            title={title}
            itemLabelPlural={itemLabelPlural}
            ruleType={ruleType}
            items={items}
            isOpen={isOpen}
            hasImages={hasImages}
            onClose={mockOnClose}
            onSubmit={mockOnSubmit}
        />,
    )
}

describe('SelectedItemsDrawer', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the component correctly when visible', () => {
        const screen = renderComponent()

        expect(screen.queryByText('All products')).toBeInTheDocument()

        expect(
            screen.getByPlaceholderText('Search products'),
        ).toBeInTheDocument()

        expect(
            screen.queryByText('Lightweight Training Hoodie'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('Breathable Mesh Tank Top'),
        ).toBeInTheDocument()
        expect(screen.queryByText('Sweat-Wicking Socks')).toBeInTheDocument()
        expect(screen.queryByText('4-Way Stretch Shorts')).toBeInTheDocument()
        expect(screen.queryByText('Foam Roller')).toBeInTheDocument()
        expect(screen.queryByText('Hydration Backpack')).toBeInTheDocument()
        expect(screen.queryByText('Gym Duffel Bag')).toBeInTheDocument()
        expect(
            screen.queryByText('Reflective Running Vest'),
        ).toBeInTheDocument()

        expect(screen.queryByText('No products found')).not.toBeInTheDocument()
    })

    it('should submit the selected items', async () => {
        const screen = renderComponent()

        fireEvent.click(screen.getByText('Sweat-Wicking Socks'))
        fireEvent.click(screen.getByText('4-Way Stretch Shorts'))
        fireEvent.click(screen.getByText('Hydration Backpack'))
        fireEvent.click(screen.getByText('Save Changes'))

        expect(mockOnSubmit).toHaveBeenCalledWith(['4', '9', '22', '27', '30'])

        await waitFor(() => expect(mockOnClose).toHaveBeenCalledTimes(1))

        await waitFor(() =>
            expect(dispatchMock).toHaveBeenCalledWith({
                message: 'Product recommendations saved.',
                status: NotificationStatus.Success,
            }),
        )
    })

    it('should close the drawer when the cancel button is clicked', () => {
        const screen = renderComponent()

        fireEvent.click(screen.getByText('Cancel'))

        expect(mockOnClose).toHaveBeenCalled()
        expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should close the drawer when escape clicked', () => {
        const screen = renderComponent()

        fireEvent.keyDown(screen.baseElement, { key: 'Escape' })

        expect(mockOnClose).toHaveBeenCalled()
        expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should handle pagination correctly', async () => {
        const screen = renderComponent({
            items: allProducts.map((product) => ({
                id: product.id.toString(),
                title: product.title,
                img: product.image?.src,
            })),
        })

        expect(
            screen.queryByText('Lightweight Training Hoodie'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('Breathable Mesh Tank Top'),
        ).toBeInTheDocument()
        expect(screen.queryByText('Sweat-Wicking Socks')).toBeInTheDocument()
        expect(screen.queryByText('4-Way Stretch Shorts')).toBeInTheDocument()

        expect(
            screen.queryByText('Grip Strength Trainer'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('Longline Sports Tee'),
        ).not.toBeInTheDocument()

        fireEvent.click(screen.getByLabelText('Next page'))

        expect(
            screen.queryByText('Lightweight Training Hoodie'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('Breathable Mesh Tank Top'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('Sweat-Wicking Socks'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('4-Way Stretch Shorts'),
        ).not.toBeInTheDocument()

        expect(screen.queryByText('Grip Strength Trainer')).toBeInTheDocument()
        expect(screen.queryByText('Longline Sports Tee')).toBeInTheDocument()

        fireEvent.click(screen.getByLabelText('Previous page'))

        expect(
            screen.queryByText('Lightweight Training Hoodie'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('Breathable Mesh Tank Top'),
        ).toBeInTheDocument()
        expect(screen.queryByText('Sweat-Wicking Socks')).toBeInTheDocument()
        expect(screen.queryByText('4-Way Stretch Shorts')).toBeInTheDocument()

        expect(
            screen.queryByText('Grip Strength Trainer'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('Longline Sports Tee'),
        ).not.toBeInTheDocument()
    })

    it('should handle search correctly', async () => {
        jest.useFakeTimers()

        const screen = renderComponent({
            items: allProducts.map((product) => ({
                id: product.id.toString(),
                title: product.title,
                img: product.image?.src,
            })),
        })

        expect(screen.getAllByRole('checkbox')).toHaveLength(25)

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText('Search products'), {
                target: { value: 'Training' },
            })
        })

        // Advance timers by 200ms to trigger the debounced effect
        jest.advanceTimersByTime(200)

        await waitFor(() =>
            expect(screen.getAllByRole('checkbox')).toHaveLength(2),
        )

        jest.useRealTimers()
    })
})
