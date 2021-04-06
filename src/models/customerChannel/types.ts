import {ReactNode} from 'react'

import {Channel} from '../ticket/types'

export type CustomerChannel = {
    address: string
    preferred: boolean
    type: Channel
    deleted_datetime: Maybe<string>
    id: number
    updated_datetime: Maybe<string>
    created_datetime: string
}

export type MultiSelectBinaryChoiceFieldOption = {
    label: ReactNode
    value: CustomerChannel
}
