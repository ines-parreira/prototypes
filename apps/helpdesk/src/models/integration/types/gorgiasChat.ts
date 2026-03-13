// g/integrations/gorgias_chat/schemas.py
import type { LanguageItem } from 'config/integrations/gorgias_chat'

import { IntegrationType } from '../constants'
import type { Integration } from './'
import type { IntegrationBase, IntegrationDecoration } from './base'

export type GorgiasChatIntegration = IntegrationBase & {
    type: IntegrationType.GorgiasChat
    meta: GorgiasChatIntegrationMeta
    decoration: IntegrationDecoration & {
        position: GorgiasChatPosition
        avatar?: {
            company_logo_url?: string
            image_type: GorgiasChatAvatarImageType
            name_type: GorgiasChatAvatarNameType
        }
        main_font_family?: string
        launcher?: {
            type: GorgiasChatLauncherType
            label?: string
        }
        background_color_style?: GorgiasChatBackgroundColorStyle
        header_picture_url?: string
        header_picture_url_offline?: string
        display_bot_label?: boolean
        use_main_color_outside_business_hours?: boolean
    }
}

export type GorgiasChatInstallationVisibility = {
    method: GorgiasChatInstallationVisibilityMethod
    match_conditions?: GorgiasChatInstallationVisibilityMatchConditions
    conditions?: GorgiasChatInstallationVisibilityCondition[]
}

export type GorgiasChatMetaInstallation = {
    visibility: Maybe<GorgiasChatInstallationVisibility>
}

export type GorgiasChatIntegrationMeta = {
    app_id?: string
    language?: string
    languages?: LanguageItem[]
    preferences?: {
        live_chat_availability?: string
        hide_outside_business_hours?: boolean
        hide_on_mobile?: boolean
        display_campaigns_hidden_chat?: boolean
        send_chat_transcript?: boolean
        offline_mode_enabled_datetime?: string | null
        control_ticket_volume?: boolean
        email_capture_enabled?: boolean
        email_capture_enforcement: GorgiasChatEmailCaptureType
        auto_responder?: {
            enabled: boolean
            reply: string
        }
        linked_email_integration?: Maybe<number>
        privacy_policy_disclaimer_enabled?: boolean
    }
    shopify_integration_ids?: number[]
    shop_name?: Maybe<string>
    shop_type?: Maybe<string>
    shop_integration_id?: Maybe<number>
    quick_replies?: {
        enabled: boolean
        replies: string[]
    }
    self_service: {
        enabled?: boolean
        configurations?: SelfServiceConfiguration[]
    }
    position?: GorgiasChatPosition
    status?: GorgiasChatStatusEnum
    wizard?: {
        step: GorgiasChatCreationWizardSteps
        status: GorgiasChatCreationWizardStatus
        installation_method?: GorgiasChatCreationWizardInstallationMethod
    }
    installation?: GorgiasChatMetaInstallation
    one_click_installation_method?: GorgiasChatInstallationMethod
    one_click_installation_datetime?: string
    one_click_uninstallation_datetime?: string
}

export enum GorgiasChatInstallationMethod {
    Asset = 'asset',
    ScriptTag = 'script_tag',
    ThemeAppExtension = 'theme_app_extension',
}

export enum GorgiasChatEmailCaptureType {
    Optional = 'optional',
    RequiredOutsideBusinessHours = 'required-outside-business-hours',
    AlwaysRequired = 'always-required',
}

export enum GorgiasChatAutoResponderReply {
    ReplyShortly = 'reply-shortly',
    ReplyInMinutes = 'reply-in-minutes',
    ReplyInHours = 'reply-in-hours',
    ReplyInDay = 'reply-in-day',
    ReplyDynamic = 'reply-dynamic',
}

export type SelfServiceConfiguration = {
    base_url: string
    enabled: boolean
    integration_id?: number
}

export const isGorgiasChatIntegration = (
    integration: Maybe<Integration>,
): integration is GorgiasChatIntegration =>
    integration?.type === IntegrationType.GorgiasChat

export enum GorgiasChatPositionAlignmentEnum {
    BOTTOM_RIGHT = 'bottom-right',
    BOTTOM_LEFT = 'bottom-left',
    TOP_RIGHT = 'top-right',
    TOP_LEFT = 'top-left',
}

export interface GorgiasChatPosition {
    alignment: GorgiasChatPositionAlignmentEnum
    offsetX: number
    offsetY: number
}

export enum GorgiasChatStatusEnum {
    ONLINE = 'online',
    OFFLINE = 'offline',
    HIDDEN = 'hidden',
    HIDDEN_OUTSIDE_BUSINESS_HOURS = 'hidden-outside-business-hours',
    /**
     * Assumed not-installed because the chat bundle-loader was not requested recently.
     */
    NOT_INSTALLED = 'not-installed',
    INSTALLED = 'installed',
}

export enum GorgiasChatLauncherType {
    ICON = 'icon',
    ICON_AND_LABEL = 'icon-label',
}

export enum GorgiasChatAvatarImageType {
    AGENT_PICTURE = 'agent-picture',
    AGENT_INITIALS = 'agent-initials',
    COMPANY_LOGO = 'company-logo',
}

export enum GorgiasChatAvatarNameType {
    AGENT_FIRST_NAME = 'agent-first-name',
    AGENT_FIRST_LAST_NAME_INITIAL = 'agent-first-last-name-initial',
    AGENT_FULLNAME = 'agent-fullname',
    CHAT_TITLE = 'chat-title',
}

export type GorgiasChatAvatarSettings = {
    imageType: GorgiasChatAvatarImageType
    nameType: GorgiasChatAvatarNameType
    companyLogoUrl?: string
}

export enum GorgiasChatBackgroundColorStyle {
    Gradient = 'gradient',
    Solid = 'solid',
}

export enum GorgiasChatCreationWizardStatus {
    Draft = 'draft',
    Published = 'published',
}

export enum GorgiasChatCreationWizardSteps {
    Basics = 'basics',
    Branding = 'branding',
    Automate = 'automate',
    Installation = 'installation',
}

export enum GorgiasChatCreationWizardInstallationMethod {
    Manual = 'manual',
    OneClick = '1-click',
}

export enum GorgiasChatInstallationVisibilityMethod {
    ShowOnEveryPage = 'show-on-every-page',
    ShowOnSpecificPages = 'show-on-specific-pages',
    HideOnSpecificPages = 'hide-on-specific-pages',
}

export enum GorgiasChatInstallationVisibilityMatchConditions {
    Every = 'every',
    Some = 'some',
}

export enum GorgiasChatInstallationVisibilityConditionOperator {
    Contain = 'contain',
    NotContain = 'not-contain',
    Equal = 'equal',
    NotEqual = 'not-equal',
}

export type GorgiasChatInstallationVisibilityCondition = {
    id: string
    value: string
    operator: GorgiasChatInstallationVisibilityConditionOperator
}

export enum GorgiasChatMinimumSnippetVersion {
    V1 = 'v1',
    V2 = 'v2',
    V3 = 'v3',
}

export const latestSnippetVersion = GorgiasChatMinimumSnippetVersion.V3

export type GetInstallationSnippetParams = {
    applicationId: string
}

export type GetInstallationSnippetResponse = {
    snippet: string
    snippetVersion: GorgiasChatMinimumSnippetVersion
    appKey: string
}

export type GorgiasChatApplicationBaseInfo = {
    id: number
    appKey: string
    name: string
}

export type GetApplicationsResponse = {
    applications: GorgiasChatApplicationBaseInfo[]
}
