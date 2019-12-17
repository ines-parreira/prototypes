// @flow

import type {Channel} from './ticket'

export type CustomerChannel = {
    address: string,
    preferred: boolean,
    type: Channel,
}
