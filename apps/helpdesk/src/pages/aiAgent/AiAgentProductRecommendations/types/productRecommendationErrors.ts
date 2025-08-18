import axios, { AxiosError } from 'axios'
import { z } from 'zod'

const ProductConflictItemSchema = z.object({
    target: z.string(),
})

const ProductConflictSchema = z.object({
    type: z.enum(['product', 'tag', 'vendor']),
    action: z.enum(['promoted', 'excluded']),
    items: z.array(ProductConflictItemSchema),
})

const ProductConflictDetailsSchema = z.object({
    productId: z.string(),
    productName: z.string(),
    conflicts: z.array(ProductConflictSchema),
})

const ProductRecommendationConflictErrorSchema = z.object({
    productConflicts: z.array(ProductConflictDetailsSchema),
})

export type ProductConflictItem = z.infer<typeof ProductConflictItemSchema>
export type ProductConflict = z.infer<typeof ProductConflictSchema>
export type ProductConflictDetails = z.infer<
    typeof ProductConflictDetailsSchema
>
export type ProductRecommendationConflictError = z.infer<
    typeof ProductRecommendationConflictErrorSchema
>

export function isProductRecommendationConflictError(
    error: unknown,
): error is AxiosError<ProductRecommendationConflictError> {
    if (!axios.isAxiosError(error)) {
        return false
    }

    if (error.response?.status !== 409) {
        return false
    }

    try {
        ProductRecommendationConflictErrorSchema.parse(error.response.data)
        return true
    } catch {
        return false
    }
}
