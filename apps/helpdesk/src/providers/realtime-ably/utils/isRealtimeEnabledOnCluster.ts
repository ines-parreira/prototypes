const GORGIAS_CLUSTER = window.GORGIAS_CLUSTER
const US_EAST1_CLUSTER = 'us-east1-635c'
const STAGING_CLUSTER = 'us-east1-86cc'

function checkIfRealtimeEnabledOnCluster() {
    return [US_EAST1_CLUSTER, STAGING_CLUSTER].includes(GORGIAS_CLUSTER)
}

export const isRealtimeEnabledOnCluster = checkIfRealtimeEnabledOnCluster()
