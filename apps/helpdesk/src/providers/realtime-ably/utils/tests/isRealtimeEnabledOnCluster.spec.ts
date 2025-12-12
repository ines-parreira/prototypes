import { SUPPORTED_CLUSTERS } from '../isRealtimeEnabledOnCluster'

describe('isRealtimeEnabledOnCluster', () => {
    const OTHER_CLUSTER = 'random-cluster'

    beforeEach(() => {
        jest.resetModules()
    })

    it.each(SUPPORTED_CLUSTERS)(
        'should return true for cluster %s',
        (cluster) => {
            window.GORGIAS_CLUSTER = cluster

            const {
                isRealtimeEnabledOnCluster,
            } = require('../isRealtimeEnabledOnCluster')

            expect(isRealtimeEnabledOnCluster).toBe(true)
        },
    )

    it('should return false when cluster is not supported', () => {
        window.GORGIAS_CLUSTER = OTHER_CLUSTER

        const {
            isRealtimeEnabledOnCluster,
        } = require('../isRealtimeEnabledOnCluster')

        expect(isRealtimeEnabledOnCluster).toBe(false)
    })
})
