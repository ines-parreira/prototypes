import { fireEvent, render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import type { StoreInformationFormProps } from '../StoreInformationForm'
import { StoreInformationForm } from '../StoreInformationForm'

const renderWithRouter = (element: React.ReactElement) => {
    return render(element, { wrapper: BrowserRouter })
}

const findToggleByTestId = (testId: string) => {
    const container = screen.getByTestId(testId)
    return container.querySelector('[role="switch"]')!
}

describe('<StoreInformationForm />', () => {
    const minProps: StoreInformationFormProps = {
        shopName: 'test-store',
        isCustomersImportOver: false,
        syncCustomerNotes: false,
        defaultAddressPhoneMatchingEnabled: false,
        onSyncCustomerNotesChange: jest.fn(),
        onDefaultAddressPhoneMatchingChange: jest.fn(),
        storeId: 123,
        isActive: true,
    }

    it('should render store information with correct shop name', () => {
        renderWithRouter(<StoreInformationForm {...minProps} />)

        expect(screen.getByText('Store Information')).toBeInTheDocument()
        expect(screen.getByDisplayValue('test-store')).toBeDisabled()
        expect(screen.getByText('.myshopify.com')).toBeInTheDocument()
        expect(screen.getByText(/Import in progress/)).toBeInTheDocument()
    })

    it('should handle customer notes sync toggle change', () => {
        renderWithRouter(
            <StoreInformationForm {...minProps} syncCustomerNotes={true} />,
        )

        const toggle = findToggleByTestId(
            'settings-feature-row-sync-customer-notes-with-shopify',
        )
        expect(toggle).toHaveAttribute('aria-checked', 'true')

        fireEvent.click(toggle)
        expect(minProps.onSyncCustomerNotesChange).toHaveBeenCalledWith(false)
    })

    it('should render customer matching toggle with correct state', () => {
        renderWithRouter(
            <StoreInformationForm
                {...minProps}
                defaultAddressPhoneMatchingEnabled={true}
            />,
        )
        const toggle = findToggleByTestId(
            'settings-feature-row-enable-customer-matching-with-shopify',
        )
        expect(toggle).toHaveAttribute('aria-checked', 'true')
        fireEvent.click(toggle)
        expect(
            minProps.onDefaultAddressPhoneMatchingChange,
        ).toHaveBeenCalledWith(false)
    })

    it('should render link to integrations settings', () => {
        renderWithRouter(<StoreInformationForm {...minProps} />)

        const link = screen.getByText('My Apps.')
        expect(link).toHaveAttribute(
            'href',
            '/app/settings/integrations/shopify/123',
        )
    })
})
