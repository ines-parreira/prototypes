export enum HelpdeskIntegrationOptions {
    ZENDESK = 'zendesk',
    INTERCOM = 'intercom',
}

export type HepldeskIntegrationRequiredFields = {
    label: string
    slug: string
    secret: boolean
}

export type HelpdeskIntegrationProperties = {
    schema: string
    requiredFields: Record<string, HepldeskIntegrationRequiredFields>
}

export type HelpdeskIntegration = Record<
    HelpdeskIntegrationOptions,
    HelpdeskIntegrationProperties
>

export type HTTPIntegrationPayload = {
    id?: number
    name: string
    type: string
    managed: boolean
    description: string
    http: {
        url: string
        headers: Record<string, string>
        request_content_type: string
        response_content_type: string
        method: string
        triggers: Record<string, boolean>
        form: Record<string, unknown>
    }
}
