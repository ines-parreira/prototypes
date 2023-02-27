import React, {ComponentProps} from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import produce from 'immer'
import {
    bigCommerceLineItemFixture,
    bigCommerceProductFixture,
} from 'fixtures/bigcommerce'
import OrderLineItemRow from '../OrderLineItemRow'

const lineItem = bigCommerceLineItemFixture()
const product = bigCommerceProductFixture()

const defaultProps: ComponentProps<typeof OrderLineItemRow> = {
    id: 'line-item',
    storeHash: 'storeHash',
    currencyCode: 'USD',
    removable: true,
    onChange: jest.fn(),
    onDelete: jest.fn(),
    index: 0,
    hasError: false,
    onLineItemDiscount: jest.fn(),
    lineItem,
    product,
    onChangeModifiers: jest.fn(),
}

jest.mock('../../../utils', () => ({
    ...jest.requireActual<Record<string, unknown>>('../../../utils'),
    useCanViewBigCommerceCreateOrderModifiers: jest.fn(() => true),
}))

jest.mock('hooks/useId', () => jest.fn(() => 'mocked'))

jest.mock('lodash/debounce', () => (fn: (...args: any[]) => void) => fn)

describe('<OrderLineItemRow/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const {container} = render(<OrderLineItemRow {...defaultProps} />)

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with the default image', () => {
            const product = bigCommerceProductFixture()
            product.image_url = ''

            const {container} = render(
                <OrderLineItemRow
                    {...defaultProps}
                    lineItem={lineItem}
                    product={product}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render without quantity and without price', () => {
            const lineItem = bigCommerceLineItemFixture()
            lineItem.quantity = 0
            lineItem.list_price = 0
            const product = bigCommerceProductFixture()

            const {container} = render(
                <OrderLineItemRow
                    {...defaultProps}
                    lineItem={lineItem}
                    product={product}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with modifiers visible', () => {
            const lineItem = produce(bigCommerceLineItemFixture(), (draft) => {
                draft.options = [
                    {
                        name: 'Option Name',
                        value: 'Option Value',
                        nameId: 166,
                        valueId: 1,
                    },
                ]
            })
            const product = bigCommerceProductFixture()
            const {container} = render(
                <OrderLineItemRow
                    {...defaultProps}
                    lineItem={lineItem}
                    product={product}
                />
            )

            expect(screen.getByText(/Option Value/i)).toBeInTheDocument()
            expect(container.firstChild).toMatchSnapshot()

            // Opens the modifiers popover
            expect(
                screen.queryByText(/Test Radio Buttons/i)
            ).not.toBeInTheDocument()

            userEvent.click(screen.getByRole('button', {name: /modify/i}))

            expect(screen.getByText(/Test Radio Buttons/i)).toBeInTheDocument()
        })
    })

    describe('on quantity changed', () => {
        it('should call onChange() with index and quantity', async () => {
            const onChangeMock = jest.fn()

            render(
                <OrderLineItemRow {...defaultProps} onChange={onChangeMock} />
            )

            await userEvent.type(screen.getByRole('textbox'), '5')

            expect(onChangeMock).toHaveBeenCalled()
        })
    })

    describe('on delete line', () => {
        it('should call onDelete() with correct index', () => {
            const onDeleteMock = jest.fn()

            render(
                <OrderLineItemRow {...defaultProps} onDelete={onDeleteMock} />
            )

            userEvent.click(screen.getByText('close'))

            expect(onDeleteMock).toHaveBeenCalledWith(0)
        })
    })

    it('should call discount callback', async () => {
        const onLineItemDiscountMock = jest.fn()
        const lineItem = bigCommerceLineItemFixture()
        lineItem.variant_id = 1

        render(
            <OrderLineItemRow
                {...defaultProps}
                lineItem={lineItem}
                onLineItemDiscount={onLineItemDiscountMock}
            />
        )

        userEvent.click(screen.getByRole('button', {name: /78/i}))
        userEvent.clear(screen.getByLabelText('Discount amount'))

        userEvent.clear(screen.getByLabelText('Discount amount'))
        await userEvent.type(screen.getByLabelText('Discount amount'), '555')

        await waitFor(() => {
            expect(
                screen.getByText('Discount cannot be higher than the price.')
            ).toBeInTheDocument()
        })

        userEvent.clear(screen.getByLabelText('Discount amount'))
        await userEvent.type(screen.getByLabelText('Discount amount'), '5')

        await waitFor(() => {
            expect(
                screen.getByRole('button', {name: /Apply/i})
            ).not.toBeDisabled()
        })

        userEvent.click(screen.getByRole('button', {name: /Apply/i}))

        expect(onLineItemDiscountMock).toHaveBeenCalledWith(0, 73, 'add')
    })
})
