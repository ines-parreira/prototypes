export const SalesEarlyAccessUtils = (accountId: number) => ({
    get modalDisplayedAtKey() {
        return `account-${accountId}.aiSalesAgentEarlyAccessModalDisplayedAt`
    },
    hasModalBeenDisplayed() {
        return !!window.localStorage.getItem(this.modalDisplayedAtKey)
    },
    persistModalDisplayedAt() {
        window.localStorage.setItem(
            this.modalDisplayedAtKey,
            new Date().toISOString(),
        )
    },
})
