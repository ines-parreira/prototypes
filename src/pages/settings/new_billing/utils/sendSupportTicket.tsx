import client from 'models/api/resources'

export type Props = {
    zapierHook: string
    subject: string
    message: string
    from: string
    to: string
    helpdeskPlan: string
    freeTrial: boolean
    account: string
}
export const sendSupportTicket = ({
    zapierHook,
    subject,
    message,
    from,
    to,
    helpdeskPlan,
    freeTrial,
    account,
}: Props) => {
    return client.get(
        `${zapierHook}?message=${encodeURIComponent(
            message
        )}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(
            to
        )}&subject=${encodeURIComponent(
            subject
        )}&helpdeskPlan=${encodeURIComponent(
            helpdeskPlan
        )}&freeTrial=${encodeURIComponent(
            freeTrial
        )}&account=${encodeURIComponent(account)}`,
        {
            transformRequest: (
                data: Record<string, unknown>,
                headers: Record<string, unknown>
            ) => {
                // We need this in order to prevent CORS policy error.
                delete headers['X-CSRF-Token']
                delete headers['X-Gorgias-User-Client']
                return data
            },
        }
    )
}
