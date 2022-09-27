export const discountCodeResult = () => {
    return {
        data: [
            {
                id: 1,
                title: 'CODE1',
                summary: '$0.00 off entire order',
                status: 'ACTIVE',
                usage_limit: 1,
                usage_count: 0,
                once_per_customer: true,
                code: 'CODE1',
                shareable_url: 'https://test.myshopify.com/discount/CODE1',
                discount_type: 'fixed',
                discount_value: null,
                starts_at: '2022-09-27T09:09:59+00:00',
                ends_at: null,
                created_at: '2022-09-27T09:10:00+00:00',
                collection_ids: [],
                product_ids: [],
            },
            {
                id: 2,
                title: 'CODE2',
                summary: '$0.00 off entire order',
                status: 'ACTIVE',
                usage_limit: 1,
                usage_count: 0,
                once_per_customer: true,
                code: 'CODE2',
                shareable_url: 'https://test.myshopify.com/discount/CODE2',
                discount_type: 'fixed',
                discount_value: null,
                starts_at: '2022-09-27T09:09:46+00:00',
                ends_at: null,
                created_at: '2022-09-27T09:09:47+00:00',
                collection_ids: [],
                product_ids: [],
            },
        ],
        object: 'list',
        uri: '/api/discount-codes/1/?search=',
        meta: {
            prev_cursor: null,
            next_cursor:
                'eyJsYXN0X2lkIjoxMDI5NDI2ODcyNDAzLCJsYXN0X3ZhbHVlIjoiMjAyMi0wOS0xNCAxMToyMzowNy4wMDAwMDAifQ==',
        },
    }
}
