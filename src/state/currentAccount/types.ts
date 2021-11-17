import {Map} from 'immutable'

import {TicketChannel} from '../../business/types/ticket'
import {Notification} from '../notifications/types'

export type CurrentAccountState = Map<any, any>

export enum AccountStatus {
    Active = 'active',
}

export enum AccountSettingType {
    BusinessHours = 'business-hours',
    TicketAssignment = 'ticket-assignment',
    SatisfactionSurveys = 'satisfaction-surveys',
    ViewsOrdering = 'views-ordering',
}

export enum AccountFeature {
    AutoAssignment = 'auto_assignment',
    ChatCampaigns = 'chat_campaigns',
    FacebookComment = 'facebook_comment',
    InstagramComment = 'instagram_comment',
    InstagramDirectMessage = 'instagram_dm',
    UsersLiveStatistics = 'users_live_statistics',
    OverviewLiveStatistics = 'overview_live_statistics',
    MagentoIntegration = 'magento_integration',
    PhoneIntegration = 'phone_integration',
    TwitterIntegration = 'twitter_integration',
    YotpoIntegration = 'yotpo_integration',
    RevenueStatistics = 'revenue_statistics',
    SatisfactionSurveys = 'satisfaction_surveys',
    Teams = 'teams',
    UserRoles = 'user_roles',
    ViewSharing = 'view_sharing',
    HelpCenter = 'help_center',
    AutomationTrackOrderFlow = 'automation_track_order_flow',
    AutomationReportIssueFlow = 'automation_report_issue_flow',
    AutomationCancellationsFlow = 'automation_cancellations_flow',
    AutomationReturnFlow = 'automation_return_flow',
    AutomationSelfServiceStatistics = 'automation_self_service_statistics',
}

export type ViewsOrderingAccountSetting = {
    id: number
    type: AccountSettingType.ViewsOrdering
    data: AccountViewsOrderingSettingData
}

export type AccountSetting =
    | AccountSettingBusinessHours
    | {
          id: number
          type: AccountSettingType.TicketAssignment
          data: {
              assignment_channels: TicketChannel[]
              auto_assign_to_teams: boolean
              unassign_on_reply: boolean
          }
      }
    | AccountSettingSatisfactionSurvey
    | ViewsOrderingAccountSetting

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

export type AccountViewsOrderingSettingData = {
    views: Record<string, {display_order: number}>
    view_sections: Record<string, {display_order: number}>
}

export type AccountFeatureMetadata = {
    enabled: boolean
    limit?: number
}

export type AccountFeatures = Record<AccountFeature, AccountFeatureMetadata>

export type Account = {
    current_subscription: {
        plan: string
        start_datetime: string
        status: 'active' | 'past_due' | 'trialing'
        trial_end_datetime: string | null
        trial_start_datetime: string | null
    }
    created_datetime: string
    deactivated_datetime: Maybe<string>
    domain: string
    meta: Record<string, unknown>
    status: {
        status: AccountStatus
        notification?: Notification
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
