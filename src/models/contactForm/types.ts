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

export type PageEmbedment = Components.Schemas.ShopifyPageEmbedmentDto

export type EmbeddablePage = Components.Schemas.ShopifyPageDto

export type CreateShopifyPageEmbedmentDto =
    Components.Schemas.CreateShopifyPageEmbedmentDto

export type UpdateShopifyPageEmbedmentDto =
    Components.Schemas.UpdateShopifyPageEmbedmentDto
