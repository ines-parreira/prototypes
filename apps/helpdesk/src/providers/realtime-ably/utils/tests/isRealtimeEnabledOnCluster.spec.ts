describe('isRealtimeEnabledOnCluster', () => {
    const US_EAST1_CLUSTER = 'us-east1-635c'
    const OTHER_CLUSTER = 'eu-west1-123a'
    const SUPPORTED_DOMAIN = 'artemisathletix'
    const UNSUPPORTED_DOMAIN = 'otherdomain'

    beforeEach(() => {
        jest.resetModules()
    })

    it.each([
        {
            cluster: US_EAST1_CLUSTER,
            domain: SUPPORTED_DOMAIN,
            expected: true,
            description: 'cluster is us-east1-635c and domain is supported',
        },
        {
            cluster: US_EAST1_CLUSTER,
            domain: UNSUPPORTED_DOMAIN,
            expected: false,
            description: 'cluster is us-east1-635c but domain is not supported',
        },
        {
            cluster: OTHER_CLUSTER,
            domain: SUPPORTED_DOMAIN,
            expected: false,
            description: 'domain is supported but cluster is different',
        },
        {
            cluster: OTHER_CLUSTER,
            domain: UNSUPPORTED_DOMAIN,
            expected: false,
            description: 'both cluster and domain are not matching',
        },
    ])(
        'should return $expected when $description',
        ({ cluster, domain, expected }) => {
            window.GORGIAS_CLUSTER = cluster
            window.GORGIAS_STATE = {
                currentAccount: { domain },
            } as any

            const {
                isRealtimeEnabledOnCluster,
            } = require('../isRealtimeEnabledOnCluster')

            expect(isRealtimeEnabledOnCluster).toBe(expected)
        },
    )
})
