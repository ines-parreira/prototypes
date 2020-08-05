import {Channel} from '../ticket/types'

export type CustomerChannel = {
    address: string
    preferred: boolean
    type: Channel
}
