import {LocaleCode} from '../../../../../models/helpCenter/types'

export type CreateContactFormParams = {
    name: string
    default_locale: LocaleCode
    email_integration: {
        id: number
        email: string
    }
}
