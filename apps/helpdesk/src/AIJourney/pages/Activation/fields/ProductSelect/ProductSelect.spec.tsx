import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useGetCurrentUser } from '@gorgias/helpdesk-queries'

import { Product } from 'constants/integrations/types/shopify'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { ProductSelectField } from './ProductSelect'

jest.mock('@gorgias/helpdesk-queries')

const mockUseGetCurrentUser = useGetCurrentUser as jest.MockedFunction<
    typeof useGetCurrentUser
>

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

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the field presentation and dropdown', async () => {
        mockUseGetCurrentUser.mockReturnValue({
            data: {
                data: {
                    name: 'Jane Smith',
                },
            },
        } as any)

        renderWithQueryClientProvider(
            <Provider store={mockStore}>
                <ProductSelectField options={options} />
            </Provider>,
        )
        expect(screen.getByText('Customer scenario')).toBeInTheDocument()
        expect(
            await screen.findByText(
                'Customer Jane Smith has left their cart with the following product',
            ),
        ).toBeInTheDocument()
        expect(screen.getAllByText('New Balance 2002R')).toHaveLength(2)
        expect(screen.getAllByText('variant title 1')).toHaveLength(2)
    })

    it('calls onChange when a dropdown option is selected', async () => {
        mockUseGetCurrentUser.mockReturnValue({
            data: {
                data: {
                    name: 'Jane Smith',
                },
            },
        } as any)

        const onChange = jest.fn()
        renderWithQueryClientProvider(
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

    it('shows fallback name when user data is not available', async () => {
        mockUseGetCurrentUser.mockReturnValue({
            data: undefined,
        } as any)

        renderWithQueryClientProvider(
            <Provider store={mockStore}>
                <ProductSelectField options={options} />
            </Provider>,
        )
        expect(screen.getByText('Customer scenario')).toBeInTheDocument()
        expect(
            await screen.findByText(
                'Customer John Doe has left their cart with the following product',
            ),
        ).toBeInTheDocument()
    })
})
