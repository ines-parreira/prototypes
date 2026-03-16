export enum TicketInfobarTab {
    AIFeedback = 'ai-feedback',
    AutoQA = 'auto-qa',
    Customer = 'customer',
    Recharge = 'recharge',
    Shopify = 'shopify',
    Timeline = 'timeline',
}

export const EditFieldsType = {
    Shopify: 'shopify',
    Recharge: 'recharge',
    Woocommerce: 'woocommerce',
    Bigcommerce: 'bigcommerce',
    Magento: 'magento',
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
