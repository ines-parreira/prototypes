// @flow
export const createErrorNotification = (error: {} = {}, reason: string) => ({
    type: 'ERROR',
    error,
    reason,
})
