import {Map} from 'immutable'

import {TicketChannel} from '../../business/types/ticket'

export type CurrentAccountState = Map<any, any>

enum AccountStatus {
    Active = 'active',
}

enum AccountSettingType {
    BusinessHours = 'business-hours',
    TicketAssignment = 'ticket-assignment',
    SatisfactionSurveys = 'satisfaction-surveys',
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
              }
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

export type Account = {
    created_datetime: string
    deactivated_datetime: Maybe<string>
    domain: string
    settings: AccountSetting[]
    status: {
        status: AccountStatus
    }
}
