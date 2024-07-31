import {Moment} from 'moment'

export type Update = {
    assignee_team_id: number | null
    assignee_user: {
        id: number
        name: string
    } | null
    is_unread: boolean
    status: 'open' | 'closed'
    tags: string[]
    trashed_datetime: Moment | null
}
