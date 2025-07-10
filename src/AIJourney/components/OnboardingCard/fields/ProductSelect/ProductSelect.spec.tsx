import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { Product } from 'constants/integrations/types/shopify'

import { ProductSelectField } from './ProductSelect'

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

describe('<ProductSelectField />', () => {
    const mockStore = configureMockStore([thunk])()

    it('renders the field presentation and dropdown', () => {
        render(
            <Provider store={mockStore}>
                <ProductSelectField options={options} />
            </Provider>,
        )
        expect(screen.getByText('Customer scenario')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Customer John doe has left their cart with the following product',
            ),
        ).toBeInTheDocument()
        expect(screen.getAllByText('New Balance 2002R')).toHaveLength(2)
        expect(screen.getAllByText('variant title 1')).toHaveLength(2)
    })

    it('calls onChange when a dropdown option is selected', async () => {
        const onChange = jest.fn()
        render(
            <Provider store={mockStore}>
                <ProductSelectField options={options} onChange={onChange} />
            </Provider>,
        )
        await userEvent.click(screen.getByText('New Very Old 2006R'))
        expect(onChange).toHaveBeenCalledWith({
            id: '942562',
            title: 'New Very Old 2006R',
            image: 'image',
            variants: [
                {
                    title: 'variant title 5',
                },
            ],
        })
    })
})
