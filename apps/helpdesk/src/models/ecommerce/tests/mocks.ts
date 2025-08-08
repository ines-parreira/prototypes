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

export const mockEcommerceProductTags = [
    {
        id: '019838e2-e878-752a-8202-eb2f0c88c48c',
        account_id: 456,
        integration_id: 123,
        source_type: 'shopify',
        lookup_type: 'product_tag',
        created_datetime: '2025-07-23T20:04:11.512000+00:00',
        value: 'Summer Collection',
    },
    {
        id: '019838e2-e878-752a-8202-eb308715a301',
        account_id: 456,
        integration_id: 123,
        source_type: 'shopify',
        lookup_type: 'product_tag',
        created_datetime: '2025-07-23T20:04:11.512000+00:00',
        value: 'Running Gear',
    },
    {
        id: '019838e2-e878-752a-8202-eb31a0c096a3',
        account_id: 456,
        integration_id: 123,
        source_type: 'shopify',
        lookup_type: 'product_tag',
        created_datetime: '2025-07-23T20:04:11.512000+00:00',
        value: 'Eco Friendly',
    },
    {
        id: '019838e2-e878-752a-8202-eb322b9978ca',
        account_id: 456,
        integration_id: 123,
        source_type: 'shopify',
        lookup_type: 'product_tag',
        created_datetime: '2025-07-23T20:04:11.512000+00:00',
        value: 'Limited Edition',
    },
    {
        id: '019838e2-e878-752a-8202-eb33a26e8372',
        account_id: 456,
        integration_id: 123,
        source_type: 'shopify',
        lookup_type: 'product_tag',
        created_datetime: '2025-07-23T20:04:11.512000+00:00',
        value: 'Best Seller',
    },
]

export const mockEcommerceVendors = [
    {
        id: '019838e2-e878-752a-8202-eb2f0c88c48c',
        account_id: 456,
        integration_id: 123,
        source_type: 'shopify',
        lookup_type: 'vendor',
        created_datetime: '2025-07-23T20:04:11.512000+00:00',
        value: 'Adidas',
    },
    {
        id: '019838e2-e878-752a-8202-eb308715a301',
        account_id: 456,
        integration_id: 123,
        source_type: 'shopify',
        lookup_type: 'vendor',
        created_datetime: '2025-07-23T20:04:11.512000+00:00',
        value: 'Nike',
    },
    {
        id: '019838e2-e878-752a-8202-eb31a0c096a3',
        account_id: 456,
        integration_id: 123,
        source_type: 'shopify',
        lookup_type: 'vendor',
        created_datetime: '2025-07-23T20:04:11.512000+00:00',
        value: 'Puma',
    },
    {
        id: '019838e2-e878-752a-8202-eb322b9978ca',
        account_id: 456,
        integration_id: 123,
        source_type: 'shopify',
        lookup_type: 'vendor',
        created_datetime: '2025-07-23T20:04:11.512000+00:00',
        value: 'Reebok',
    },
    {
        id: '019838e2-e878-752a-8202-eb33a26e8372',
        account_id: 456,
        integration_id: 123,
        source_type: 'shopify',
        lookup_type: 'vendor',
        created_datetime: '2025-07-23T20:04:11.512000+00:00',
        value: 'Under Armour',
    },
]
