export enum TicketInfobarTab {
    AIFeedback = 'ai-feedback',
    AutoQA = 'auto-qa',
    BigCommerce = 'bigcommerce',
    Customer = 'customer',
    Magento = 'magento',
    Recharge = 'recharge',
    Shopify = 'shopify',
    Smile = 'smile',
    Timeline = 'timeline',
    WooCommerce = 'woocommerce',
    Yotpo = 'yotpo',
}

export const EditFieldsType = {
    Shopify: 'shopify',
    Recharge: 'recharge',
    Woocommerce: 'woocommerce',
    Bigcommerce: 'bigcommerce',
    Magento: 'magento2',
    Yotpo: 'yotpo',
    Smile: 'smile',
    Custom: 'custom',
} as const

export type EditFieldsType =
    (typeof EditFieldsType)[keyof typeof EditFieldsType]

export const SOURCE_PANEL_WIDGET_TYPES = new Set<EditFieldsType>([
    EditFieldsType.Recharge,
    EditFieldsType.Woocommerce,
    EditFieldsType.Bigcommerce,
    EditFieldsType.Magento,
    EditFieldsType.Yotpo,
    EditFieldsType.Smile,
    EditFieldsType.Custom,
])
