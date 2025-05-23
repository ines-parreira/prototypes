import { ShopifyMetafieldType } from '@gorgias/helpdesk-queries'

import { extractGid, prepareGidUrl } from '../Gid'

describe('extractGid', () => {
    it('should extractGid', () => {
        const url = 'gid://shopify/Product/471971234070'
        const gid = extractGid(url)
        expect(gid).toEqual('471971234070')
    })

    it.each([null, undefined, '', 'test'])(
        'should return empty when %p',
        (url: any) => {
            const gid = extractGid(url)
            expect(gid).toEqual(undefined)
        },
    )
})

describe('prepareGuidUrl()', () => {
    it('should return product admin url when given product_reference type', () => {
        const storeName = 'test-store'
        const gid = '213213'
        const url = prepareGidUrl(
            ShopifyMetafieldType.ProductReference,
            storeName,
            gid,
        )
        expect(url).toEqual(
            `https://admin.shopify.com/store/${storeName}/products/${gid}`,
        )
    })

    it('should return page admin url when given page_reference type', () => {
        const storeName = 'test-store'
        const gid = '213213'
        const url = prepareGidUrl(
            ShopifyMetafieldType.PageReference,
            storeName,
            gid,
        )
        expect(url).toEqual(
            `https://admin.shopify.com/store/${storeName}/pages/${gid}`,
        )
    })

    it('should return collection admin url when given collection_reference type', () => {
        const storeName = 'test-store'
        const gid = '213213'
        const url = prepareGidUrl(
            ShopifyMetafieldType.CollectionReference,
            storeName,
            gid,
        )
        expect(url).toEqual(
            `https://admin.shopify.com/store/${storeName}/collections/${gid}`,
        )
    })

    it('should return undefined for any other type', () => {
        const storeName = 'test-store'
        const gid = '213213'
        const url = prepareGidUrl(ShopifyMetafieldType.Url, storeName, gid)
        expect(url).toEqual(undefined)
    })
})
