import {GuidanceTemplate, GuidanceTemplateKey} from '../types'

export const getGuidanceTemplateFixture = (
    id: GuidanceTemplateKey,
    overrides?: Partial<Omit<GuidanceTemplate, 'id'>>
): GuidanceTemplate => ({
    id,
    name: 'Damaged or defective item',
    content: `<p>If no order data is found for a customer asking a question about their order, you will ask the customer to confirm their order number and the email address used to place the order (if not provided already).</p>`,
    excerpt:
        'If no order data is found for a customer asking a question about their order, you will ask the customer to confirm their order number and the email address used to place the order (if not provided already).',
    tag: 'Damaged items',
    style: {color: '#3A0F7E', background: '#EDEAFF'},
    ...overrides,
})
