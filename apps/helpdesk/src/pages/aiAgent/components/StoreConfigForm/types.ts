export type SmsPhoneNumber = {
    id: number
    type: 'sms'
    name: string
    phoneNumberName: string
    address: string
    isDeactivated: boolean
    channel: string
}
