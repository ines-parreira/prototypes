import { Field } from '../../MetafieldsTable/types'

export const mockImportableFields: Field[] = [
    {
        id: '_1',
        name: 'New Delivery type',
        type: 'single_line_text',
        category: 'order',
        isVisible: false,
    },
    {
        id: '_2',
        name: 'New Integer field',
        type: 'integer',
        category: 'customer',
        isVisible: false,
    },
    {
        id: '_3',
        name: 'New Order package size',
        type: 'volume',
        category: 'draft_order',
        isVisible: false,
    },
    {
        id: '_4',
        name: 'New Order package size 2',
        type: 'volume',
        category: 'draft_order',
        isVisible: false,
    },
]
