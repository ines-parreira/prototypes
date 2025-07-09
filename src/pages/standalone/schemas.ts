import { z, ZodIssueCode } from 'zod'

import { isEmail } from 'utils'

import { INTEGRATIONS_MAPPING } from './constants'
import { HelpdeskIntegrationOptions } from './types'

export type HandoverFormValues = {
    handoverMethod: string
    email?: string
    emailIntegration?: number
    webhookIntegration?: number
    webhookThirdParty?: string
    webhookRequiredFields?: Record<string, string>
}

export const handoverSchema = z
    .object({
        handoverMethod: z.string(),
        email: z.string().optional(),
        emailIntegration: z.number().optional(),
        webhookIntegration: z.number().optional(),
        webhookThirdParty: z.string().optional(),
        webhookRequiredFields: z.record(z.string()).optional(),
    })
    .superRefine((data, ctx) => {
        switch (data.handoverMethod) {
            case 'email':
                if (!data.email) {
                    ctx.addIssue({
                        code: ZodIssueCode.custom,
                        message: 'Email is required for email handover.',
                        path: ['email'],
                    })
                }
                if (data.email && !isEmail(data.email)) {
                    ctx.addIssue({
                        code: ZodIssueCode.custom,
                        message:
                            'Email format must include @ and a domain, e.g. example@domain.com.',
                        path: ['email'],
                    })
                }
                if (!data.emailIntegration) {
                    ctx.addIssue({
                        code: ZodIssueCode.custom,
                        message:
                            'An outbound email is required for email handover.',
                        path: ['emailIntegration'],
                    })
                }
                break
            case 'webhook':
                if (!data.webhookThirdParty) {
                    ctx.addIssue({
                        code: ZodIssueCode.custom,
                        message:
                            'An integration is required for webhook handover.',
                        path: ['webhookThirdParty'],
                    })
                }
                Object.entries(data.webhookRequiredFields ?? {}).forEach(
                    ([key, value]) => {
                        const fieldLabel =
                            INTEGRATIONS_MAPPING[
                                data.webhookThirdParty as HelpdeskIntegrationOptions
                            ]?.requiredFields[key].label
                        if (value === '') {
                            ctx.addIssue({
                                code: ZodIssueCode.custom,
                                message: `${fieldLabel} is required for webhook handover.`,
                                path: ['webhookRequiredFields', key],
                            })
                        }
                    },
                )
                break
            default:
                break
        }
    })
