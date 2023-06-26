import client from 'models/api/resources'

export type Props = {
    zapierHook: string
    subject: string
    message: string
    from: string
    to: string
}
export const sendSupportTicket = ({
    zapierHook,
    subject,
    message,
    from,
    to,
}: Props) => {
    return client.get(
        `${zapierHook}?message=${encodeURIComponent(
            message
        )}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(
            to
        )}&subject=${encodeURIComponent(subject)}`,
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
