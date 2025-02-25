import client from 'models/api/resources'

export type Props = {
    zapierHook: string
    subject: string
    message: string
    from: string
    to: string
    helpdeskPlan: string
    automationPlan: string
    freeTrial: boolean
    account: string
}
export const sendRemoveNotificationZap = ({
    zapierHook,
    subject,
    message,
    from,
    to,
    helpdeskPlan,
    automationPlan,
    freeTrial,
    account,
}: Props) => {
    const params = new URLSearchParams(
        `message=${message}&from=${from}&to=${to}&subject=${subject}&helpdeskPlan=${helpdeskPlan}
        &automationPlan=${automationPlan}&freeTrial=${freeTrial.toString()}&account=${account}`,
    )
    return client.get(`${zapierHook}?${params.toString()}`, {
        transformRequest: (
            data: Record<string, unknown>,
            headers: Record<string, unknown>,
        ) => {
            // We need this in order to prevent CORS policy error.
            delete headers['X-CSRF-Token']
            delete headers['X-Gorgias-User-Client']
            return data
        },
    })
}
