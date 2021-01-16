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

export type AccountSetting =
    | {
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
    | {
          id: number
          type: AccountSettingType.TicketAssignment
          data: {
              assignment_channels: TicketChannel[]
              auto_assign_to_teams: boolean
              unassign_on_reply: boolean
          }
      }
    | {
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
    | {
          id: number
          type: AccountSettingType.ViewsOrdering
          data: AccountViewsOrderingSettingData
      }

export type AccountViewsOrderingSettingData = {
    views: Record<string, {display_order: number}>
    view_sections: Record<string, {display_order: number}>
}

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
}
