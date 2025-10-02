const GORGIAS_CLUSTER = window.GORGIAS_CLUSTER
const US_EAST1_CLUSTER = 'us-east1-635c'
const ACCOUNT_DOMAIN = window.GORGIAS_STATE.currentAccount.domain
const supportedAccountDomains = ['artemisathletix']

function checkIfRealtimeEnabledOnCluster() {
    return (
        GORGIAS_CLUSTER === US_EAST1_CLUSTER &&
        supportedAccountDomains.includes(ACCOUNT_DOMAIN)
    )
}

export const isRealtimeEnabledOnCluster = checkIfRealtimeEnabledOnCluster()
