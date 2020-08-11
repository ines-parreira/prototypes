import {List} from 'immutable'

enum AuthItemType {
    ApiKey = 'api_key',
}

export type AuthItem = {
    data: {
        token: string
    }
    id: number
    name: Maybe<string>
    type: AuthItemType
}

export type AuthsState = List<any>
