const GORGIAS_CLUSTER = window.GORGIAS_CLUSTER

const STAGING_CLUSTER = 'us-east1-86cc'

export const SUPPORTED_CLUSTERS = [
    'aus-southeast1-fcb9',
    'europe-west1-c511',
    'europe-west3-86c1',
    'us-central1-d8ff',
    'us-central1-c433',
    'us-east1-2607',
    'us-east1-635c',
    'us-east1-c94b',
    'europe-west4-e7f4',
    'us-east4-65cd',
    'us-east4-5f09',
    STAGING_CLUSTER,
]

function checkIfRealtimeEnabledOnCluster() {
    return SUPPORTED_CLUSTERS.includes(GORGIAS_CLUSTER)
}

export const isRealtimeEnabledOnCluster = checkIfRealtimeEnabledOnCluster()
