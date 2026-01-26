import React from 'react'

import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useListShopifyCustomerMetafields } from '@gorgias/helpdesk-queries'
import type { ShopifyMetafield } from '@gorgias/helpdesk-types'

import { CustomerMetafields } from '../CustomerMetafields'

jest.mock('@gorgias/helpdesk-queries')

const mockUseListShopifyCustomerMetafields =
    useListShopifyCustomerMetafields as jest.Mock

const mockStore = configureMockStore([thunk])()

describe('<CustomerMetafields/>', () => {
    it('should return loading state', () => {
        mockUseListShopifyCustomerMetafields.mockReturnValue({
            isLoading: true,
            data: null,
        })

        const { container } = render(
            <CustomerMetafields integrationId={1} customerId={1} />,
        )

        const elementsByClassName = container.getElementsByClassName('loader')

        expect(elementsByClassName[0]).toBeInTheDocument()
        expect(mockUseListShopifyCustomerMetafields).toHaveBeenCalled()
    })

    it('should return error state', () => {
        mockUseListShopifyCustomerMetafields.mockReturnValue({
            isError: true,
            data: null,
        })

        render(<CustomerMetafields integrationId={1} customerId={1} />)

        expect(mockUseListShopifyCustomerMetafields).toHaveBeenCalled()
        expect(
            screen.getByText('Temporarily unavailable, try again later.'),
        ).toBeInTheDocument()
    })

    it('should return empty state', () => {
        mockUseListShopifyCustomerMetafields.mockReturnValue({
            data: {
                data: {
                    data: [],
                },
            },
        })

        render(<CustomerMetafields integrationId={1} customerId={1} />)

        expect(mockUseListShopifyCustomerMetafields).toHaveBeenCalled()
        expect(
            screen.getByText('Customer has no metafields populated.'),
        ).toBeInTheDocument()
    })

    it('should return metafields', () => {
        mockUseListShopifyCustomerMetafields.mockReturnValue({
            data: {
                data: {
                    data: [
                        {
                            type: 'single_line_text_field',
                            namespace: 'test_namespace',
                            key: 'test_key',
                            value: 'test_value',
                        },
                    ],
                },
            },
        })

        render(
            <Provider store={mockStore}>
                <CustomerMetafields integrationId={1} customerId={1} />
            </Provider>,
        )

        expect(mockUseListShopifyCustomerMetafields).toHaveBeenCalled()
        expect(screen.getByText('Test Key:')).toBeInTheDocument()
        expect(screen.getByText('test_value')).toBeInTheDocument()
    })

    it('should render source metafields when useSourceMetafields is true', () => {
        const sourceMetafields = [
            {
                type: 'single_line_text_field',
                namespace: 'test_namespace',
                key: 'source_key',
                value: 'source_value',
            },
        ] as ShopifyMetafield[]

        render(
            <Provider store={mockStore}>
                <CustomerMetafields
                    integrationId={1}
                    customerId={1}
                    metafields={sourceMetafields}
                    useSourceMetafields={true}
                />
            </Provider>,
        )

        expect(screen.getByText('Source Key:')).toBeInTheDocument()
        expect(screen.getByText('source_value')).toBeInTheDocument()
    })

    it('should return empty state when API returns undefined data', () => {
        mockUseListShopifyCustomerMetafields.mockReturnValue({
            data: {
                data: {},
            },
        })

        render(<CustomerMetafields integrationId={1} customerId={1} />)

        expect(
            screen.getByText('Customer has no metafields populated.'),
        ).toBeInTheDocument()
    })

    it('should return empty state when useSourceMetafields is true but metafields is empty', () => {
        mockUseListShopifyCustomerMetafields.mockReturnValue({
            data: null,
        })

        render(
            <CustomerMetafields
                integrationId={1}
                customerId={1}
                metafields={[]}
                useSourceMetafields={true}
            />,
        )

        expect(
            screen.getByText('Customer has no metafields populated.'),
        ).toBeInTheDocument()
    })
})
