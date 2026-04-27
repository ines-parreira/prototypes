export function isInaccessibleViewItemsError(error: unknown) {
    if (typeof error !== 'object' || error === null) {
        return false
    }

    const response =
        'response' in error && typeof error.response === 'object'
            ? error.response
            : null

    return response !== null && 'status' in response && response.status === 404
}
