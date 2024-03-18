import React from 'react'
import {useListShopifyOrderMetafields} from '@gorgias/api-queries'
import {render, screen} from '@testing-library/react'
import OrderMetafields from '../OrderMetafields'

jest.mock('@gorgias/api-queries')

const mockUseListShopifyOrderMetafields =
    useListShopifyOrderMetafields as jest.Mock

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
                            namespace: 'test_namespace',
                            key: 'test_key',
                            value: 'test_value',
                        },
                    ],
                },
            },
        })

        render(<OrderMetafields integrationId={1} orderId={1} />)

        expect(mockUseListShopifyOrderMetafields).toHaveBeenCalled()
        expect(screen.getByText('test_namespace.test_key:')).toBeInTheDocument()
        expect(screen.getByText('test_value')).toBeInTheDocument()
    })
})
