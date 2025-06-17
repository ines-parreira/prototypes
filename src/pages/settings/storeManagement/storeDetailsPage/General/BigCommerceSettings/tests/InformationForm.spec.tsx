import React from 'react'

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { InformationForm } from '../InformationForm'

describe('InformationForm', () => {
    const defaultProps = {
        shopName: 'teststore',
        isSyncComplete: true,
        storeId: 123,
    }

    const renderComponent = (props = defaultProps) => {
        return render(
            <MemoryRouter>
                <InformationForm {...props} />
            </MemoryRouter>,
        )
    }

    it('renders store information correctly', () => {
        renderComponent()

        expect(screen.getByText('Store Information')).toBeInTheDocument()
        expect(screen.getByText('Store name')).toBeInTheDocument()
        expect(screen.getByDisplayValue('teststore')).toBeInTheDocument()
        expect(screen.getByText('.mybigcommerce.com')).toBeInTheDocument()

        const link = screen.getByText(/my apps/i)
        expect(link).toHaveAttribute(
            'to',
            '/app/settings/integrations/bigcommerce/123',
        )
        expect(
            screen.getByText('Import complete. The real-time sync is active.'),
        ).toBeInTheDocument()
    })

    it('displays sync notification when sync is not complete', () => {
        renderComponent({
            ...defaultProps,
            isSyncComplete: false,
        })

        expect(
            screen.getByText(
                /Import in progress. We typically sync 3,000 customers an hour. /,
            ),
        ).toBeInTheDocument()
    })
})
