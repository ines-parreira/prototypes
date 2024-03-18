import React from 'react'
import {ShopifyMetafield} from '@gorgias/api-queries'
import {render, screen} from '@testing-library/react'
import ShopifyMetafields from '../ShopifyMetafields'

describe('<ShopifyMetafields />', () => {
    it('should render one ShopifyMetafield', () => {
        const data = [
            {
                namespace: 'test_namespace',
                key: 'test_key',
                value: 'test_value',
            } as ShopifyMetafield,
        ]

        render(<ShopifyMetafields metafields={data} />)

        expect(screen.getByText('test_namespace.test_key:')).toBeInTheDocument()
        expect(screen.getByText('test_value')).toBeInTheDocument()
    })

    it('should render ShopifyMetafields', () => {
        const data = [
            {
                namespace: 'test_namespace1',
                key: 'test_key1',
                value: 'test_value1',
            } as ShopifyMetafield,
            {
                namespace: 'test_namespace2',
                key: 'test_key2',
                value: 'test_value2',
            } as ShopifyMetafield,
        ]

        render(<ShopifyMetafields metafields={data} />)

        expect(
            screen.getByText('test_namespace1.test_key1:')
        ).toBeInTheDocument()
        expect(screen.getByText('test_value1')).toBeInTheDocument()
        expect(
            screen.getByText('test_namespace2.test_key2:')
        ).toBeInTheDocument()
        expect(screen.getByText('test_value2')).toBeInTheDocument()
    })
})
