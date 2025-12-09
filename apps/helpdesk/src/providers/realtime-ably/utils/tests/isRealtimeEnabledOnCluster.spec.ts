describe('isRealtimeEnabledOnCluster', () => {
    const US_EAST1_CLUSTER = 'us-east1-635c'
    const STAGING_CLUSTER = 'us-east1-86cc'
    const OTHER_CLUSTER = 'europe-west1-c511'

    beforeEach(() => {
        jest.resetModules()
    })

    it.each([
        {
            cluster: US_EAST1_CLUSTER,
            expected: true,
            description: 'cluster is us-east1-635c ',
        },
        {
            cluster: STAGING_CLUSTER,
            expected: true,
            description: 'cluster is us-east1-86cc',
        },
        {
            cluster: OTHER_CLUSTER,
            expected: false,
            description: 'cluster is not us-east1-635c',
        },
    ])('should return $expected when $description', ({ cluster, expected }) => {
        window.GORGIAS_CLUSTER = cluster

        const {
            isRealtimeEnabledOnCluster,
        } = require('../isRealtimeEnabledOnCluster')

        expect(isRealtimeEnabledOnCluster).toBe(expected)
    })
})
