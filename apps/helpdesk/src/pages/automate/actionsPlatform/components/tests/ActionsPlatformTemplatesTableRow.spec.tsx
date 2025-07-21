import React from 'react'

import { act, fireEvent, render, screen } from '@testing-library/react'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { IntegrationType } from 'models/integration/constants'

import ActionsPlatformTemplatesTableRow from '../ActionsPlatformTemplatesTableRow'

jest.mock('hooks/useGetDateAndTimeFormat')

const mockUseGetDateAndTimeFormat = jest.mocked(useGetDateAndTimeFormat)

mockUseGetDateAndTimeFormat.mockReturnValue('MM/DD/YYYY')

describe('<ActionsPlatformTemplatesTableRow />', () => {
    it('should render template row', () => {
        render(
            <ActionsPlatformTemplatesTableRow
                template={{
                    name: 'test',
                    apps: [{ type: 'shopify' }],
                    updated_datetime: '2024-08-02T08:18:51.611Z',
                    is_draft: false,
                }}
                app={{
                    icon: '/assets/img/integrations/shopify.png',
                    id: 'shopify',
                    name: 'Shopify',
                    type: IntegrationType.Shopify,
                }}
                onClick={jest.fn()}
                onDelete={jest.fn()}
            />,
        )

        expect(screen.getByText('test')).toBeInTheDocument()
        expect(screen.getByTitle('Shopify')).toHaveAttribute(
            'src',
            '/assets/img/integrations/shopify.png',
        )
        expect(screen.getByText('08/02/2024')).toBeInTheDocument()
    })

    it('should render draft template row', () => {
        render(
            <ActionsPlatformTemplatesTableRow
                template={{
                    name: 'test',
                    apps: [{ type: 'shopify' }],
                    updated_datetime: '2024-08-02T08:18:51.611Z',
                    is_draft: true,
                }}
                app={{
                    icon: '/assets/img/integrations/shopify.png',
                    id: 'shopify',
                    name: 'Shopify',
                    type: IntegrationType.Shopify,
                }}
                onClick={jest.fn()}
                onDelete={jest.fn()}
            />,
        )

        expect(screen.getByText('draft')).toBeInTheDocument()
    })

    it('should allow to delete draft template', () => {
        const mockOnDelete = jest.fn()

        render(
            <ActionsPlatformTemplatesTableRow
                template={{
                    name: 'test',
                    apps: [{ type: 'shopify' }],
                    updated_datetime: '2024-08-02T08:18:51.611Z',
                    is_draft: true,
                }}
                app={{
                    icon: '/assets/img/integrations/shopify.png',
                    id: 'shopify',
                    name: 'Shopify',
                    type: IntegrationType.Shopify,
                }}
                onClick={jest.fn()}
                onDelete={mockOnDelete}
            />,
        )

        act(() => {
            fireEvent.click(screen.getByText('delete'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Delete'))
        })

        expect(mockOnDelete).toHaveBeenCalled()
    })

    it('should not allow to delete non-draft template', () => {
        render(
            <ActionsPlatformTemplatesTableRow
                template={{
                    name: 'test',
                    apps: [{ type: 'shopify' }],
                    updated_datetime: '2024-08-02T08:18:51.611Z',
                    is_draft: false,
                }}
                app={{
                    icon: '/assets/img/integrations/shopify.png',
                    id: 'shopify',
                    name: 'Shopify',
                    type: IntegrationType.Shopify,
                }}
                onClick={jest.fn()}
                onDelete={jest.fn()}
            />,
        )

        expect(screen.getByTitle('Delete')).toBeAriaDisabled()
    })
})
