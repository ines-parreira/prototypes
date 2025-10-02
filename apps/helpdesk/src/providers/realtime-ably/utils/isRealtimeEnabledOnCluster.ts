const GORGIAS_CLUSTER = window.GORGIAS_CLUSTER
const US_EAST1_CLUSTER = 'us-east1-635c'

function checkIfRealtimeEnabledOnCluster() {
    return GORGIAS_CLUSTER === US_EAST1_CLUSTER
}

export const isRealtimeEnabledOnCluster = checkIfRealtimeEnabledOnCluster()
