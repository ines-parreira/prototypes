import {isGorgiasApiError} from 'models/api/types'

export default function handleApiError(error: Error) {
    if (
        isGorgiasApiError<{
            metrics?: Record<string, string>
            target_channels?: string[]
        }>(error) &&
        error.response.status === 400
    ) {
        if (error.response.data.error?.msg) {
            if (error.response.data.error.data) {
                const {metrics, target_channels} =
                    error.response.data.error.data
                const metricsErrorMessage =
                    metrics &&
                    Object.values(metrics).reduce((acc, value) => {
                        return acc + `<li>` + value + `</li>`
                    }, '')
                const targetChannelsErrorMessage =
                    target_channels &&
                    target_channels.reduce((acc, value) => {
                        return acc + `<li>` + value + `</li>`
                    }, '')

                return (
                    error.response.data.error.msg +
                    (!!metricsErrorMessage && !!targetChannelsErrorMessage
                        ? `<ul>${metricsErrorMessage}</ul>` +
                          `<ul>${targetChannelsErrorMessage}</ul>`
                        : !!metricsErrorMessage
                        ? `<ul>${metricsErrorMessage}</ul>`
                        : !!targetChannelsErrorMessage
                        ? `<ul>${targetChannelsErrorMessage}</ul>`
                        : '')
                )
            }
            return error.response.data.error.msg
        }
        return
    }
    return
}
