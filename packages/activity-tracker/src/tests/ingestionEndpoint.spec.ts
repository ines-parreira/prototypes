import { getActivityTrackerIngestionEndpoint } from '../ingestionEndpoint'

describe('ingestionEndpoint', () => {
    it('should use the development URL when running locally', () => {
        expect(
            getActivityTrackerIngestionEndpoint({
                cluster: 'dev',
                hostname: 'localhost',
                isDevelopment: true,
            }),
        ).toBe('http://localhost:8076/private/track')
    })

    it('should use the preview URL when the hostname is a preview namespace', () => {
        expect(
            getActivityTrackerIngestionEndpoint({
                cluster: 'dev',
                hostname: 'pr-84.preview.gorgias.xyz',
                isDevelopment: false,
            }),
        ).toBe(
            'https://pr-84-events-ingestion.preview.gorgias.xyz/private/track',
        )
    })

    it('should use the GORGIAS_CLUSTER URL when not on a preview hostname', () => {
        expect(
            getActivityTrackerIngestionEndpoint({
                cluster: 'us-east1-86cc',
                hostname: 'my-shop.gorgias.com',
                isDevelopment: false,
            }),
        ).toBe(
            'https://us-east1-86cc.events-ingestion-helpdesk.services.gorgias.com/private/track',
        )
    })
})
