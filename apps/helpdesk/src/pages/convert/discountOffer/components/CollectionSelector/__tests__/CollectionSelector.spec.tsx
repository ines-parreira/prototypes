import React from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { useCollectionsFromShopifyIntegration } from 'models/integration/queries'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import CollectionSelector from '../CollectionSelector'

jest.mock('models/integration/queries')

const queryClient = mockQueryClient()

const useCollectionsFromShopifyIntegrationMock = assumeMock(
    useCollectionsFromShopifyIntegration,
)

describe('<CollectionSelector />', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

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

        const { getByText } = render(
            <QueryClientProvider client={queryClient}>
                <CollectionSelector {...props} />
            </QueryClientProvider>,
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

        const { getByText } = render(
            <QueryClientProvider client={queryClient}>
                <CollectionSelector {...props} />
            </QueryClientProvider>,
        )

        expect(getByText('Select a product collection')).toBeInTheDocument()
    })

    it('makes requests when user types in search', async () => {
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

        render(
            <QueryClientProvider client={queryClient}>
                <CollectionSelector {...props} />
            </QueryClientProvider>,
        )

        const element = screen.getByText('Select a product collection')
        fireEvent.focus(element)

        const input = screen.getByRole('textbox')

        act(() => {
            fireEvent.change(input, { target: { value: 'product' } })
            // Make sure all debounced functions are called
            jest.runAllTimers()
        })

        await waitFor(() => {
            expect(
                useCollectionsFromShopifyIntegrationMock,
            ).toHaveBeenCalledWith(1, { search: 'product' })
        })
    })
})
