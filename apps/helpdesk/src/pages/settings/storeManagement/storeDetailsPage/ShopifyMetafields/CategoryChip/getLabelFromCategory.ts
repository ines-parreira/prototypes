import { MetafieldCategory } from '../types'

export default function getLabelFromCategory(category?: MetafieldCategory) {
    switch (category) {
        case 'order':
            return 'Order'
        case 'customer':
            return 'Customer'
        case 'draft_order':
            return 'Draft Order'
        default:
            return ''
    }
}
