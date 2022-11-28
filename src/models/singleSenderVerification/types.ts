export type SenderInformation = {
    address: string
    city: string
    country: string
    email: string
}

export type SenderVerification = SenderInformation & {
    id: number
    integration_id: number
    verified_at: string
    created_datetime: string
    updated_datetime: string
    last_email_sent_at: string
    status: VerificationStatus
}

export enum VerificationStatus {
    EmailNotSent = 'email_not_sent',
    EmailSent = 'email_sent',
    Failed = 'failed',
    Verified = 'verified',
}
