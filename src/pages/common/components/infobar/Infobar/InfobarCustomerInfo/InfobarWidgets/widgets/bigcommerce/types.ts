export enum BigCommerceActionType {
    CreateOrder = 'bigCommerceCreateOrder',
}

export type Customer = {
    id: number
    email: string
}

export type LineItem = {
    quantity: number
    product_id: number
}

export type BigCommercePayload = {
    line_items: Array<LineItem>
    customer_id: number
}

export type BigCommerceResponse = {
    id: string
}
