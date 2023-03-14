import {
    EmailIntegration,
    GmailIntegration,
    OutlookIntegration,
} from 'models/integration/types'
import {LocaleCode} from 'models/helpCenter/types'

export type ContactFormIntegration =
    | EmailIntegration
    | GmailIntegration
    | OutlookIntegration

export interface ContactForm {
    id: number
    name: string
    default_locale: LocaleCode
    source: string
    subject_lines: {
        options: Record<string, string[]>
        allow_other: boolean
        created_datetime: string
        updated_datetime: string
    }
    email_integration: {
        id: number
        email: string
    }
    uid: string
    code_snippet_template: string
    url_template: string
}

export type CreateContactFormDto = Pick<
    ContactForm,
    'name' | 'email_integration'
> & {
    locale: LocaleCode
}

export type UpdateContactFormDto = Pick<
    ContactForm,
    'name' | 'email_integration'
> & {
    subject_lines: {
        options: Record<string, string[]>
        allow_other: boolean
    }
}
