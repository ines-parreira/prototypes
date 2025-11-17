import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { Product } from 'constants/integrations/types/shopify'

import { ProductDropdown } from './ProductDropdown'

const options = [
    {
        id: '3219312',
        title: 'New Balance 2002R',
        image: 'image',
        variants: [
            {
                title: 'variant title 1',
            },
        ],
    },
    {
        id: '321312590',
        title: 'New Ancient 2003R',
        image: 'image',
        variants: [
            {
                title: 'variant title 2',
            },
        ],
    },
    {
        id: '09827',
        title: 'New Elder 2004R',
        image: 'image',
        variants: [
            {
                title: 'variant title 3',
            },
        ],
    },
    {
        id: '00923',
        title: 'New Old 2005S',
        image: 'image',
        variants: [
            {
                title: 'variant title 4',
            },
        ],
    },
    {
        id: '942562',
        title: 'New Very Old 2006R',
        image: 'image',
        variants: [
            {
                title: 'variant title 5',
            },
        ],
    },
] as unknown as Product[]

describe('<ProductDropdown />', () => {
    const mockStore = configureMockStore([thunk])()

    it('renders with first option selected', () => {
        render(
            <Provider store={mockStore}>
                <ProductDropdown options={options} />
            </Provider>,
        )

        options.forEach((option, index) => {
            expect(screen.getAllByText(option.title)).toHaveLength(
                index === 0 ? 2 : 1,
            )
            expect(screen.getAllByText(option.variants[0].title)).toHaveLength(
                index === 0 ? 2 : 1,
            )
        })
    })

    it('calls onChange when an option is clicked', async () => {
        const onChange = jest.fn()
        render(
            <Provider store={mockStore}>
                <ProductDropdown options={options} onChange={onChange} />
            </Provider>,
        )
        const trigger = screen.getByRole('group')
        await userEvent.click(trigger)
        await userEvent.click(screen.getByText('variant title 3'))
        expect(onChange).toHaveBeenCalledWith({
            id: '09827',
            title: 'New Elder 2004R',
            image: 'image',
            variants: [
                {
                    title: 'variant title 3',
                },
            ],
        })
    })

    it('preselect option if no selectedOption is set', () => {
        const onChange = jest.fn()

        const { rerender } = render(
            <Provider store={mockStore}>
                <ProductDropdown options={[]} onChange={onChange} />
            </Provider>,
        )

        expect(onChange).not.toHaveBeenCalled()

        rerender(
            <Provider store={mockStore}>
                <ProductDropdown options={options} />
            </Provider>,
        )

        expect(onChange).not.toHaveBeenCalled()

        rerender(
            <Provider store={mockStore}>
                <ProductDropdown options={options} onChange={onChange} />
            </Provider>,
        )

        expect(onChange).toHaveBeenCalledWith({
            id: '3219312',
            title: 'New Balance 2002R',
            image: 'image',
            variants: [
                {
                    title: 'variant title 1',
                },
            ],
        })
    })
})
