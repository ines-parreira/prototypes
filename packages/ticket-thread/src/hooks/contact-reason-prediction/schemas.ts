import { z } from 'zod'

export const contactReasonCustomFieldSchema = z.object({
    prediction: z
        .object({
            display: z.boolean().optional(),
        })
        .optional(),
})
export type ContactReasonCustomFieldSchema = z.infer<
    typeof contactReasonCustomFieldSchema
>
export const contactReasonCustomFieldsSchema = z.record(
    contactReasonCustomFieldSchema,
)
export type ContactReasonCustomFieldsSchema = z.infer<
    typeof contactReasonCustomFieldsSchema
>
