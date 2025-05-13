import {
    NewPhoneNumber,
    OldPhoneNumber,
} from '../../../models/phoneNumber/types'

export type PhoneNumbersState = {
    [key: number]: OldPhoneNumber
}

export type NewPhoneNumbersState = {
    [key: number]: NewPhoneNumber
}
