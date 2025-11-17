import type { THIRD_PARTY_APP_NAME_KEY } from 'state/widgets/constants'

export type CustomerExternalData = {
    [key in string | number]: Record<string, unknown> & {
        [THIRD_PARTY_APP_NAME_KEY]: string
    }
}
