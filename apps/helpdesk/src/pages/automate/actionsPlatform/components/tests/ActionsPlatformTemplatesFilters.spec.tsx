import React from 'react'

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { IntegrationType } from 'models/integration/constants'

import type { App } from '../../types'
import ActionsPlatformTemplatesFilters from '../ActionsPlatformTemplatesFilters'

describe('<ActionsPlatformTemplatesFilters />', () => {
    it('should render app filter', () => {
        const shopifyApp: App = {
            icon: '/assets/img/integrations/shopify.png',
            id: 'shopify',
            name: 'Shopify',
            type: IntegrationType.Shopify,
        }

        const mockOnAppChange = jest.fn()

        render(
            <ActionsPlatformTemplatesFilters
                apps={[shopifyApp]}
                app={null}
                onAppChange={mockOnAppChange}
                name={''}
                onNameChange={jest.fn()}
            />,
        )

        act(() => {
            fireEvent.click(screen.getByText('Select value...'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Shopify'))
        })

        expect(mockOnAppChange).toBeCalledWith(shopifyApp)

        act(() => {
            fireEvent.click(screen.getByText('close'))
        })

        expect(mockOnAppChange).toBeCalledWith(null)
    })

    it('should render name filter', async () => {
        const mockOnNameChange = jest.fn()

        render(
            <ActionsPlatformTemplatesFilters
                apps={[]}
                app={null}
                onAppChange={jest.fn()}
                name={''}
                onNameChange={mockOnNameChange}
            />,
        )

        act(() => {
            fireEvent.change(screen.getByPlaceholderText('Search name'), {
                target: {
                    value: 'test',
                },
            })
        })

        await waitFor(() => {
            expect(mockOnNameChange).toBeCalledWith('test')
        })
    })
})
