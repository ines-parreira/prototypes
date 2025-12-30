import { render } from '../../../../tests/render.utils'
import { ShopifyCustomerInfo } from '../ShopifyCustomerInfo'

describe('ShopifyCustomerInfo', () => {
    it('renders', () => {
        const { container } = render(<ShopifyCustomerInfo />)

        expect(container.firstChild).toBeNull()
    })
})
