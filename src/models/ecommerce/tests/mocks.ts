export const mockEcommerceItem = {
    id: '123',
    title: 'Test Product',
    vendor: 'Test Vendor',
    body_html: '<p>Test description</p>',
    images: [
        {
            id: 'img1',
            src: 'https://example.com/image1.jpg',
        },
        {
            id: 'img2',
            src: 'https://example.com/image2.jpg',
        },
    ],
    variants: [
        {
            id: 'var1',
            title: 'Variant 1',
            price: '29.99',
            compare_at_price: '39.99',
        },
        {
            id: 'var2',
            title: 'Variant 2',
            price: '34.99',
            compare_at_price: null,
        },
    ],
    additional_info: {
        scraped_data: {
            data: {
                product_name: 'Test Product',
                product_id: '123',
                description: 'Test description',
                shipping_policy: 'Free shipping on orders over $50',
                sizing: 'One size fits all',
                web_pages: [
                    {
                        url: 'https://example.com/product/123',
                    },
                ],
            },
        },
    },
}

export const mockEcommerceData = {
    data: {
        ...mockEcommerceItem,
    },
}
