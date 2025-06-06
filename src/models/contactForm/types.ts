import {
    EmailIntegration,
    GmailIntegration,
    OutlookIntegration,
} from 'models/integration/types'
import { Components } from 'rest_api/help_center_api/client.generated'

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

export type ContactFormPageEmbedment = Components.Schemas.PageEmbedmentDto

export type CreateShopifyPageEmbedmentDto =
    Components.Schemas.CreateShopifyPageEmbedmentDto

export type UpdateShopifyPageEmbedmentDto =
    Components.Schemas.UpdatePageEmbedmentDto

export type ContactFormExtraHTMLDto = Components.Schemas.ContactFormExtraHTMLDto
