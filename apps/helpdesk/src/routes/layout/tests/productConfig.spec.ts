import { Product, productConfig } from 'routes/layout/productConfig'

describe('productConfig', () => {
    it('should use comm-send icon for AI Journey (Marketing) product', () => {
        expect(productConfig[Product.Marketing].icon).toBe('comm-send')
    })
})
