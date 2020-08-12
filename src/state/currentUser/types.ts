import {Map} from 'immutable'

import {UserPreferences} from '../../config/types/user'

export type UserPreferencesForm = {
    data: UserPreferences
    id?: number
    user_id: number
    type: string
}

export type CurrentUserState = Map<any, any>
