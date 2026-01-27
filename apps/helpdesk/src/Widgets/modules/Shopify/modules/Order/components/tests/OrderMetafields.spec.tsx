import React from 'react'

import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useListShopifyOrderMetafields } from '@gorgias/helpdesk-queries'
import type { ShopifyMetafield } from '@gorgias/helpdesk-types'

import WrappedOrderMetafields, { OrderMetafields } from '../OrderMetafields'

jest.mock('@gorgias/helpdesk-queries')

const mockUseListShopifyOrderMetafields =
    useListShopifyOrderMetafields as jest.Mock

const mockStore = configureMockStore([thunk])()

describe('<OrderMetafields/>', () => {
    it('should return loading state', () => {
        mockUseListShopifyOrderMetafields.mockReturnValue({
            isLoading: true,
            data: null,
        })

        const { container } = render(
            <OrderMetafields integrationId={1} orderId={1} />,
        )

        const elementsByClassName = container.getElementsByClassName('loader')

        expect(elementsByClassName[0]).toBeInTheDocument()
        expect(mockUseListShopifyOrderMetafields).toHaveBeenCalled()
    })

    it('should return error state', () => {
        mockUseListShopifyOrderMetafields.mockReturnValue({
            isError: true,
            data: null,
        })

        render(<OrderMetafields integrationId={1} orderId={1} />)

        expect(mockUseListShopifyOrderMetafields).toHaveBeenCalled()
        expect(
            screen.getByText('Temporarily unavailable, try again later.'),
        ).toBeInTheDocument()
    })

    it('should return empty state', () => {
        mockUseListShopifyOrderMetafields.mockReturnValue({
            data: {
                data: {
                    data: [],
                },
            },
        })

        render(<OrderMetafields integrationId={1} orderId={1} />)

        expect(mockUseListShopifyOrderMetafields).toHaveBeenCalled()
        expect(
            screen.getByText('Order has no metafields populated.'),
        ).toBeInTheDocument()
    })

    it('should return metafields', () => {
        mockUseListShopifyOrderMetafields.mockReturnValue({
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
                <OrderMetafields integrationId={1} orderId={1} />
            </Provider>,
        )

        expect(mockUseListShopifyOrderMetafields).toHaveBeenCalled()
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
                <OrderMetafields
                    integrationId={1}
                    orderId={1}
                    metafields={sourceMetafields}
                    useSourceMetafields={true}
                />
            </Provider>,
        )

        expect(screen.getByText('Source Key:')).toBeInTheDocument()
        expect(screen.getByText('source_value')).toBeInTheDocument()
    })

    it('should return empty state when API returns undefined data', () => {
        mockUseListShopifyOrderMetafields.mockReturnValue({
            data: {
                data: {},
            },
        })

        render(<OrderMetafields integrationId={1} orderId={1} />)

        expect(
            screen.getByText('Order has no metafields populated.'),
        ).toBeInTheDocument()
    })

    it('should return empty state when useSourceMetafields is true but metafields is empty', () => {
        mockUseListShopifyOrderMetafields.mockReturnValue({
            data: null,
        })

        render(
            <OrderMetafields
                integrationId={1}
                orderId={1}
                metafields={[]}
                useSourceMetafields={true}
            />,
        )

        expect(
            screen.getByText('Order has no metafields populated.'),
        ).toBeInTheDocument()
    })
})

describe('<WrappedOrderMetafields/>', () => {
    beforeEach(() => {
        mockUseListShopifyOrderMetafields.mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
        })
    })

    it('should render expanded by default when useSourceMetafields is true', () => {
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
                <WrappedOrderMetafields
                    integrationId={1}
                    orderId={1}
                    metafields={sourceMetafields}
                    useSourceMetafields={true}
                />
            </Provider>,
        )

        expect(screen.getByTitle('Fold this card')).toBeInTheDocument()
        expect(screen.getByText('Source Key:')).toBeInTheDocument()
        expect(screen.getByText('source_value')).toBeInTheDocument()
    })

    it('should render collapsed by default when useSourceMetafields is false', () => {
        render(
            <Provider store={mockStore}>
                <WrappedOrderMetafields
                    integrationId={1}
                    orderId={1}
                    useSourceMetafields={false}
                />
            </Provider>,
        )

        expect(screen.getByTitle('Unfold this card')).toBeInTheDocument()
        expect(
            screen.queryByText('Order has no metafields populated.'),
        ).not.toBeInTheDocument()
    })

    it('should render collapsed by default when useSourceMetafields is undefined', () => {
        render(
            <Provider store={mockStore}>
                <WrappedOrderMetafields integrationId={1} orderId={1} />
            </Provider>,
        )

        expect(screen.getByTitle('Unfold this card')).toBeInTheDocument()
    })
})
