export type SmsPhoneNumber = {
    id: number
    type: 'sms'
    name: string
    phoneNumberName: string
    address: string
    isDeactivated: boolean
    channel: string
}

export type SocialsIntegration = {
    id: number
    pageName: string
    instagramUsername: string
}
