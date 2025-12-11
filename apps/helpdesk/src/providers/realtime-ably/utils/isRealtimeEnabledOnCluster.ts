const GORGIAS_CLUSTER = window.GORGIAS_CLUSTER

const US_EAST1_CLUSTER = 'us-east1-635c'
const US_EAST4_CLUSTER = 'us-east4-65cd'
const AUS_SOUTHEAST1_CLUSTER = 'aus-southeast1-fcb9'
const STAGING_CLUSTER = 'us-east1-86cc'

const SUPPORTED_CLUSTERS = [
    US_EAST1_CLUSTER,
    US_EAST4_CLUSTER,
    AUS_SOUTHEAST1_CLUSTER,
    STAGING_CLUSTER,
]

function checkIfRealtimeEnabledOnCluster() {
    return SUPPORTED_CLUSTERS.includes(GORGIAS_CLUSTER)
}

export const isRealtimeEnabledOnCluster = checkIfRealtimeEnabledOnCluster()
