export const formatIntentLabel = (intentId: string) =>
    intentId.replace(/::/g, '/').toLowerCase()
