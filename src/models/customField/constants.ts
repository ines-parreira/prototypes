export const VALUE_TYPES = [
    {
        value: 'dropdown',
        icon: 'arrow_drop_down',
        name: 'Dropdown',
        description: 'Choose one option from a list',
    },
    {
        value: 'input',
        icon: 'title',
        name: 'Text',
        description: 'Add descriptions, notes, or other text',
    },
]

export const DROPDOWN_NESTING_DELIMITER = '::'

const csvTemplateData = [
    ['Exchange/Return', 'Change of mind'],
    ['Exchange/Return', 'Wrong color'],
    ['Exchange/Return', 'Wrong size'],
    ['Fulfilment', 'Missing item'],
    ['Fulfilment', 'Wrong item'],
    ['Order', 'Cancel'],
    ['Order', 'Change'],
    ['Pre-sale', 'Coupon/Discount'],
    ['Pre-sale', 'Notify when in stock'],
    ['Pre-sale', 'Question'],
    ['Pre-sale', 'Recommendation'],
    ['Pre-sale', 'Website questions'],
    ['Shipping', 'Arrived late'],
    ['Shipping', 'Damaged in Transit'],
    ['Shipping', 'Delivered Not Received'],
    ['Shipping', 'Lost in Transit'],
    ['Shipping', 'Tracking'],
    ['Shipping', 'WISMO'],
    ['Warranty & Damage', 'Broken', 'In Window'],
    ['Warranty & Damage', 'Broken', 'Outside Window'],
    ['Warranty & Damage', 'Question'],
]
export const DROPDOWN_CSV_TEMPLATE = csvTemplateData
    .map((row: string[]) => Array.from({...row, length: 3}).join(','))
    .join('\n')
