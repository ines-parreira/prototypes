import { mockUserAvailability } from '@gorgias/helpdesk-mocks'

import { getActiveStatusId } from '../getActiveStatusId'

describe('getActiveStatusId', () => {
    it('returns undefined when availability is undefined', () => {
        expect(getActiveStatusId(undefined)).toBeUndefined()
    })

    it('returns the system status id for non-custom statuses', () => {
        expect(
            getActiveStatusId(
                mockUserAvailability({ user_status: 'available' }),
            ),
        ).toBe('available')
        expect(
            getActiveStatusId(
                mockUserAvailability({ user_status: 'unavailable' }),
            ),
        ).toBe('unavailable')
    })

    it('returns the custom status id for custom statuses', () => {
        expect(
            getActiveStatusId(
                mockUserAvailability({
                    user_status: 'custom',
                    custom_user_availability_status_id: 'custom-123',
                }),
            ),
        ).toBe('custom-123')
    })
})
