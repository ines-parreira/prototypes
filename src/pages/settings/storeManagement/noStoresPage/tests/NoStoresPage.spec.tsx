import React from 'react'

import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import NoStoresPage from '../NoStoresPage'

const renderComponent = () => {
    return render(
        <BrowserRouter>
            <NoStoresPage />
        </BrowserRouter>,
    )
}

describe('NoStoresPage', () => {
    it('should render the component', () => {
        const { getByText, getByRole } = renderComponent()
        expect(getByText('Store Management')).toBeInTheDocument()
        expect(getByText('Connect your first store')).toBeInTheDocument()
        const button = getByRole('button', { name: /connect store/i })
        expect(button).toBeInTheDocument()
    })

    it('should have correct link to integrations page', () => {
        const { container } = renderComponent()
        const link = container.querySelector(
            'a[to="/app/settings/integrations?category=Ecommerce"]',
        )
        expect(link).toBeInTheDocument()
    })
})
