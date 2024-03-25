import React from 'react'
import {useListShopifyOrderMetafields} from '@gorgias/api-queries'
import {render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import OrderMetafields from '../OrderMetafields'

jest.mock('@gorgias/api-queries')

const mockUseListShopifyOrderMetafields =
    useListShopifyOrderMetafields as jest.Mock

const mockStore = configureMockStore([thunk])()

describe('<OrderMetafields/>', () => {
    it('should return loading state', () => {
        mockUseListShopifyOrderMetafields.mockReturnValue({
            isLoading: true,
            data: null,
        })

        const {container} = render(
            <OrderMetafields integrationId={1} orderId={1} />
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
            screen.getByText('Temporarily unavailable, try again later')
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
        expect(screen.getByText('No metafields setup yet')).toBeInTheDocument()
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
            </Provider>
        )

        expect(mockUseListShopifyOrderMetafields).toHaveBeenCalled()
        expect(screen.getByText('Test Key:')).toBeInTheDocument()
        expect(screen.getByText('test_value')).toBeInTheDocument()
    })
})
