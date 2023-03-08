import {Language} from 'constants/languages'
import {
    EmailIntegration,
    GmailIntegration,
    OutlookIntegration,
} from 'models/integration/types'

export type ContactFormIntegration =
    | EmailIntegration
    | GmailIntegration
    | OutlookIntegration

export interface ContactForm {
    id: number
    name: string
    default_locale: Language
    source: string
    subject_lines: {
        options: Record<string, string[]>
        allow_other: boolean
        created_datetime: string
        updated_datetime: string
    }
    email_integration: {
        id: 1
        email: string
    }
    uid: string
    code_snippet_template: string
    url_template: string
}
