import React from 'react'
import {render} from '@testing-library/react'
import {QueryClientProvider} from '@tanstack/react-query'
import {assumeMock} from 'utils/testing'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import {useCollectionsFromShopifyIntegration} from 'models/integration/queries'
import CollectionSelector from '../CollectionSelector'

jest.mock('models/integration/queries')

const queryClient = mockQueryClient()

const useCollectionsFromShopifyIntegrationMock = assumeMock(
    useCollectionsFromShopifyIntegration
)

describe('<CollectionSelector />', () => {
    it('renders', () => {
        useCollectionsFromShopifyIntegrationMock.mockReturnValue({
            data: [
                {
                    id: 1,
                    title: 'Lorem Ipsum',
                },
            ],
        } as any)

        const props = {
            value: null,
            integrationId: 1,
            onChange: jest.fn(),
        }

        const {getByText} = render(
            <QueryClientProvider client={queryClient}>
                <CollectionSelector {...props} />
            </QueryClientProvider>
        )

        expect(getByText('Select a product collection')).toBeInTheDocument()
    })

    it('renders if query returned undefinied', () => {
        useCollectionsFromShopifyIntegrationMock.mockReturnValue({
            data: undefined,
        } as any)

        const props = {
            value: null,
            integrationId: 1,
            onChange: jest.fn(),
        }

        const {getByText} = render(
            <QueryClientProvider client={queryClient}>
                <CollectionSelector {...props} />
            </QueryClientProvider>
        )

        expect(getByText('Select a product collection')).toBeInTheDocument()
    })
})
