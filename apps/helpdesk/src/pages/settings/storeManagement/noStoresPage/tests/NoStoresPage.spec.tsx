import { renderWithRouter } from 'utils/testing'

import NoStoresPage from '../NoStoresPage'

const renderComponent = () => {
    return renderWithRouter(<NoStoresPage />)
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
            'a[href="/app/settings/integrations?category=Ecommerce"]',
        )
        expect(link).toBeInTheDocument()
    })
})
