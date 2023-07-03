import {Components} from 'rest_api/help_center_api/client.generated'
import {
    EmailIntegration,
    GmailIntegration,
    OutlookIntegration,
} from 'models/integration/types'

export type ContactFormIntegration =
    | EmailIntegration
    | GmailIntegration
    | OutlookIntegration

export type ContactFormAutomationSettings =
    Components.Schemas.AutomationSettingsDto

export type ContactForm = Components.Schemas.ContactFormDto

export type UpdateSubjectLinesProps = {
    options: string[]
    allow_other: boolean
}

export type CreateContactFormDto = Components.Schemas.CreateContactFormDto

export type UpdateContactFormDto = Components.Schemas.UpdateContactFormDto

export type UpsertContactFormAutomationSettingsDto =
    Components.Schemas.UpsertAutomationSettingsDto
