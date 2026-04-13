import { z } from 'zod'

import { InfluencedOrderSource } from './constants'

export const ticketThreadInfluencedOrderSchema = z.object({
    orderId: z.number(),
    orderNumber: z.number(),
    shopName: z.string(),
    created_datetime: z.string(),
    influencedBy: z.nativeEnum(InfluencedOrderSource),
})
export type TicketThreadInfluencedOrderSchema = z.infer<
    typeof ticketThreadInfluencedOrderSchema
>

export const influencedOrderSchema = z.object({
    id: z.number(),
    integrationId: z.number(),
    ticketId: z.number(),
    createdDatetime: z.string(),
    source: z.string().nullable().optional(),
})
export type InfluencedOrderSchema = z.infer<typeof influencedOrderSchema>

export const shopifyOrderSchema = z.object({
    id: z.number(),
    order_number: z.number(),
})
export type ShopifyOrderSchema = z.infer<typeof shopifyOrderSchema>

export const shopifyIntegrationSchema = z.object({
    id: z.number(),
    name: z.string(),
})
export type ShopifyIntegrationSchema = z.infer<typeof shopifyIntegrationSchema>
