import { EditFieldsType } from '@repo/navigation'

import { getInfobarEditModeHeaderTitle } from '../getInfobarEditModeHeaderTitle'

describe('getInfobarEditModeHeaderTitle', () => {
    it('returns the plural Custom widgets label for custom integrations', () => {
        expect(getInfobarEditModeHeaderTitle(EditFieldsType.Custom)).toBe(
            'Editing Custom widgets',
        )
    })

    it.each([
        [EditFieldsType.Shopify, 'Editing Shopify widget'],
        [EditFieldsType.Recharge, 'Editing Recharge widget'],
        [EditFieldsType.Yotpo, 'Editing Yotpo widget'],
        [EditFieldsType.Smile, 'Editing Smile widget'],
        [EditFieldsType.Bigcommerce, 'Editing BigCommerce widget'],
        [EditFieldsType.Magento, 'Editing Magento widget'],
        [EditFieldsType.Woocommerce, 'Editing WooCommerce widget'],
    ])(
        'returns singular widget label for named integration %s',
        (editingWidgetType, expected) => {
            expect(getInfobarEditModeHeaderTitle(editingWidgetType)).toBe(
                expected,
            )
        },
    )
})
