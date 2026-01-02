import { z } from 'zod'

import type { BillingContactDetailResponse, TaxId } from 'state/billing/types'
import { TaxIdType, TaxIdVerificationStatus } from 'state/billing/types'

const createTaxIdSchema = <T extends TaxIdType>(type: T): z.Schema<TaxId<T>> =>
    z.object({
        type: z.literal(type),
        value: z.string(),
        verification: z.nativeEnum(TaxIdVerificationStatus),
    }) as z.Schema<TaxId<T>>

export const getBillingContactSchema: z.Schema<BillingContactDetailResponse> =
    z.object({
        email: z.string().email(),
        shipping: z.object({
            address: z.object({
                city: z.string(),
                country: z.string(),
                line1: z.string(),
                line2: z.union([z.string(), z.null()]),
                postal_code: z.string(),
                state: z.string().optional(),
            }),
            name: z.string(),
            phone: z.union([z.string(), z.null()]).optional(),
        }),
        tax_ids: z
            .object({
                [TaxIdType.eu_vat]: createTaxIdSchema(TaxIdType.eu_vat),
                [TaxIdType.au_abn]: createTaxIdSchema(TaxIdType.au_abn),
                [TaxIdType.ca_gst_hst]: createTaxIdSchema(TaxIdType.ca_gst_hst),
                [TaxIdType.ca_pst_bc]: createTaxIdSchema(TaxIdType.ca_pst_bc),
                [TaxIdType.ca_pst_mb]: createTaxIdSchema(TaxIdType.ca_pst_mb),
                [TaxIdType.ca_pst_sk]: createTaxIdSchema(TaxIdType.ca_pst_sk),
                [TaxIdType.ca_qst]: createTaxIdSchema(TaxIdType.ca_qst),
            })
            .partial()
            .optional(),
    })
