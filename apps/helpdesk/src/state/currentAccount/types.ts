import type { Map } from 'immutable'

import type { TicketChannel } from 'business/types/ticket'
import type {
    AgentAvailabilityTableColumn,
    AgentsTableColumn,
    AgentsTableRow,
    ChannelsTableColumns,
    ProductInsightsTableColumns,
    TableColumnSet,
    TableRowSet,
    TableSetting,
} from 'domains/reporting/state/ui/stats/types'
import type { SubscriptionStatus } from 'models/billing/types'
import type { BannerNotificationFromBackend } from 'state/notifications/types'

export type CurrentAccountState = Map<any, any>

export enum AccountStatus {
    Active = 'active',
}

export enum AccountSettingType {
    Access = 'access',
    AgentCosts = 'agent-costs',
    AgentsTableConfig = 'agents-table-config',
    AgentAvailabilityTableConfig = 'agents-availability-table-config',
    ChannelsTableConfig = 'channels-table-config',
    ProductInsightsTableConfig = 'product-insights-table-config',
    BusinessHours = 'business-hours',
    SatisfactionSurveys = 'satisfaction-surveys',
    TicketAssignment = 'ticket-assignment',
    ViewsOrdering = 'views-ordering',
    ViewsVisibility = 'views-visibility',
    AutoMerge = 'auto-merge',
    InTicketSuggestion = 'in-ticket-suggestion',
    DefaultIntegration = 'default-integration',
    Limits = 'limits',
}

export enum AccountFeature {
    Api1stPartyRateLimit = 'api_1st_party_rate_limit',
    Api3rdPartyRateLimit = 'api_3rd_party_rate_limit',
    AutoAssignment = 'auto_assignment',
    FacebookComment = 'facebook_comment',
    InstagramComment = 'instagram_comment',
    InstagramDirectMessage = 'instagram_dm',
    UsersLiveStatistics = 'users_live_statistics',
    OverviewLiveStatistics = 'overview_live_statistics',
    MagentoIntegration = 'magento_integration',
    TwitterIntegration = 'twitter_integration',
    YotpoIntegration = 'yotpo_integration',
    RevenueStatistics = 'revenue_statistics',
    SatisfactionSurveys = 'satisfaction_surveys',
    PhoneNumber = 'phone_number',
    Teams = 'teams',
    UserRoles = 'user_roles',
    ViewSharing = 'view_sharing',
    HelpCenter = 'help_center',
    AutomationTrackOrderFlow = 'automation_track_order_flow',
    AutomationReportIssueFlow = 'automation_report_issue_flow',
    AutomationCancellationsFlow = 'automation_cancellations_flow',
    AutomationReturnFlow = 'automation_return_flow',
    AutomationSelfServiceStatistics = 'automation_self_service_statistics',
    AutomationAddonOverview = 'automation_addon_overview',
    AutomationManagedRules = 'automation_managed_rules',
}

export type ViewsOrderingAccountSetting = {
    id: number
    type: AccountSettingType.ViewsOrdering
    data: AccountViewsOrderingSettingData
}

export type AccountSetting =
    | AccountSettingBusinessHours
    | AccountSettingTicketAssignment
    | AccountSettingSatisfactionSurvey
    | ViewsOrderingAccountSetting
    | AccountSettingAccess
    | AccountSettingViewsVisibility
    | AccountSettingAutoMerge
    | AccountSettingAgentCosts
    | AccountSettingAgentsTableConfig
    | AccountSettingAgentAvailabilityTableConfig
    | AccountSettingChannelsTableConfig
    | AccountSettingProductInsightsTableConfig
    | AccountSettingInTicketSuggestion
    | AccountSettingDefaultIntegration

export type AccountSettingAgentCostType = 'yearly' | 'hourly'

export type AccountSettingAgentCosts = {
    id: number
    type: AccountSettingType.AgentCosts
    data: {
        agent_cost_type: AccountSettingAgentCostType
        agent_cost_per_ticket: number
        agent_ticket_per_hour: number
    }
}

export type AccountSettingBusinessHours = {
    id: number
    type: AccountSettingType.BusinessHours
    data: {
        timezone: string
        business_hours: {
            days: string
            from_time: string
            to_time: string
        }[]
    }
}

export type BusinessHour =
    AccountSettingBusinessHours['data']['business_hours'][number]

export type AccountSettingTicketAssignment = {
    id: number
    type: AccountSettingType.TicketAssignment
    data: {
        assignment_channels: TicketChannel[]
        auto_assign_to_teams: boolean
        unassign_on_reply: boolean
        unassign_on_user_unavailability?: TicketChannel[]
        max_user_chat_ticket: number
        max_user_non_chat_ticket: number
        can_exceed_max_agent_capacity?: boolean
        auto_assign_ticket_to_responding_agent?: boolean
    }
}

export type AccountSettingSatisfactionSurvey = {
    id: number
    type: AccountSettingType.SatisfactionSurveys
    data: {
        send_survey_for_chat: boolean
        send_survey_for_email: boolean
        survey_email_html: string
        survey_email_text: string
        survey_interval: number
    }
}

export type AccountSettingAgentsTableConfig = {
    id: number
    type: AccountSettingType.AgentsTableConfig
    data: TableSetting<AgentsTableColumn, AgentsTableRow>
}

export type AccountSettingAgentAvailabilityTableConfig = {
    id: number
    type: AccountSettingType.AgentAvailabilityTableConfig
    data: TableSetting<AgentAvailabilityTableColumn, AgentsTableRow>
}

export type AccountSettingChannelsTableConfig = {
    id: number
    type: AccountSettingType.ChannelsTableConfig
    data: TableSetting<ChannelsTableColumns, never>
}

export type AccountSettingProductInsightsTableConfig = {
    id: number
    type: AccountSettingType.ProductInsightsTableConfig
    data: TableSetting<ProductInsightsTableColumns, never>
}

export type AccountSettingTableConfig<
    T extends TableColumnSet,
    R extends TableRowSet,
> = {
    id: number
    type:
        | AccountSettingType.AgentsTableConfig
        | AccountSettingType.AgentAvailabilityTableConfig
        | AccountSettingType.ChannelsTableConfig
        | AccountSettingType.ProductInsightsTableConfig
    data: TableSetting<T, R>
}

export type AccountViewsOrderingSettingData = {
    views: Record<string, { display_order: number }>
    views_top: Record<string, { display_order: number }>
    views_bottom: Record<string, { display_order: number }>
    view_sections: Record<string, { display_order: number }>
}

export interface CustomSSOProvider {
    name: string
    client_id: string
    client_secret?: string
    server_metadata_url: string
}

export interface CustomSSOProviders {
    [providerId: string]: CustomSSOProvider
}

export type AccountSettingAccess = {
    id: number
    type: AccountSettingType.Access
    data: {
        signup_mode: AccountSettingAccessSignupMode
        allowed_domains: string[]
        google_sso_enabled: boolean
        office365_sso_enabled: boolean
        two_fa_enforced_datetime: string | null
        sso_enforced_datetime: string | null
        custom_sso_providers?: CustomSSOProviders
    }
}

export enum AccountSettingAccessSignupMode {
    Invite = 'invite',
    AllowedDomains = 'allowed-domains',
}

export type AccountSettingViewsVisibility = {
    id: number
    type: AccountSettingType.ViewsVisibility
    data: {
        hidden_views: number[]
    }
}

export type AccountSettingAutoMerge = {
    id: number
    type: AccountSettingType.AutoMerge
    data: {
        tickets?: {
            enabled: boolean
            merging_window_days: number
        }
    }
}

export type AccountFeatureMetadata = {
    enabled: boolean
    limit?: number
    rate_limit?: {
        interval_ms: number
        max_burst: number
    }
}

export type AccountSettingInTicketSuggestion = {
    id: number
    type: AccountSettingType.InTicketSuggestion
    data: {
        is_demo_hidden: boolean
    }
}

export type AccountSettingDefaultIntegration = {
    id: number
    type: AccountSettingType.DefaultIntegration
    data: Record<string, number>
}

export type AccountFeatures = Record<AccountFeature, AccountFeatureMetadata>

export type Account = {
    id: number
    current_subscription: {
        start_datetime: string
        status: SubscriptionStatus
        trial_end_datetime: string | null
        trial_start_datetime: string | null
        products: Record<string, string>
        scheduled_to_cancel_at: string | null
    }
    created_datetime: string
    deactivated_datetime: Maybe<string>
    domain: string
    meta: Record<string, unknown>
    status: {
        status: AccountStatus
        notification?: BannerNotificationFromBackend
    }
    stripe_id: string
    settings: AccountSetting[]
    user_id: number
    features: AccountFeatures
}

export enum ShopifyBillingStatus {
    Active = 'active',
    Canceled = 'canceled',
    Inactive = 'inactive',
}
