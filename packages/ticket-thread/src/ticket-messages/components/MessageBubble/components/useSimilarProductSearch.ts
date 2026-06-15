import { z } from 'zod'

type ProductReferenceMeta = {
    id: number
    imageUrl: string | null
    title: string
    url: string
    featureImageUrl?: string
    variantId?: string
}

const productReferenceSchema = z
    .object({
        url: z.string(),
        id: z.number(),
        title: z.string(),
        featureImageUrl: z.string().nullable().optional(),
        variantId: z.number().optional(),
    })
    .transform(
        (data): ProductReferenceMeta => ({
            id: data.id,
            title: data.title,
            url: data.url,
            imageUrl: data.featureImageUrl ?? null,
            featureImageUrl: data.featureImageUrl ?? undefined,
            variantId: data.variantId?.toString(),
        }),
    )

const similarProductsSearchSchema = z.object({
    productId: z.string(),
    variantId: z.string(),
})

const metaSchema = z.object({
    similar_products_search: similarProductsSearchSchema.optional(),
    product_reference: productReferenceSchema.optional(),
})

export const useSimilarProductsSearch = (
    ticketMessageMetadata: unknown,
): {
    shouldRender: boolean
    productReference?: ProductReferenceMeta
} => {
    const parsed = metaSchema.safeParse(ticketMessageMetadata)
    if (!parsed.success || !parsed.data.similar_products_search) {
        return { shouldRender: false }
    }
    return {
        shouldRender: true,
        productReference: parsed.data.product_reference,
    }
}
