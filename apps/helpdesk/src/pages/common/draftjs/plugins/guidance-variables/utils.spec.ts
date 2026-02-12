import logoGorgias from 'assets/img/icons/gorgias-icon-logo-black.png'
import logoShopify from 'assets/img/integrations/shopify.svg'

import { pickCategoryLogo } from './utils'

describe('pickCategoryLogo', () => {
    it('should return Gorgias logo for ticket category', () => {
        const result = pickCategoryLogo('ticket')

        expect(result).toEqual({
            src: logoGorgias,
            alt: 'gorgias logo',
        })
    })

    it('should return Gorgias logo for TICKET category (case insensitive)', () => {
        const result = pickCategoryLogo('TICKET')

        expect(result).toEqual({
            src: logoGorgias,
            alt: 'gorgias logo',
        })
    })

    it('should return Gorgias logo for Ticket category (mixed case)', () => {
        const result = pickCategoryLogo('Ticket')

        expect(result).toEqual({
            src: logoGorgias,
            alt: 'gorgias logo',
        })
    })

    it('should return Shopify logo for customer category', () => {
        const result = pickCategoryLogo('customer')

        expect(result).toEqual({
            src: logoShopify,
            alt: 'shopify logo',
        })
    })

    it('should return Shopify logo for order category', () => {
        const result = pickCategoryLogo('order')

        expect(result).toEqual({
            src: logoShopify,
            alt: 'shopify logo',
        })
    })

    it('should return Shopify logo for unknown category', () => {
        const result = pickCategoryLogo('unknown')

        expect(result).toEqual({
            src: logoShopify,
            alt: 'shopify logo',
        })
    })

    it('should return Shopify logo for empty string', () => {
        const result = pickCategoryLogo('')

        expect(result).toEqual({
            src: logoShopify,
            alt: 'shopify logo',
        })
    })
})
