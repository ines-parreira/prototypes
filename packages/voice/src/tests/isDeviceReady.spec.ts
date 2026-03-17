import type { Device } from '@twilio/voice-sdk'

import { isDeviceReady } from '../device/isDeviceReady'

describe('isDeviceReady', () => {
    it('should return true if the device is registered', () => {
        expect(
            isDeviceReady({
                state: 'registered',
            } as Device),
        ).toBe(true)
    })

    it.each(['unregistered', 'registering', 'destroyed'])(
        'should return false if the device is %s',
        (state) => {
            expect(
                isDeviceReady({
                    state,
                } as Device),
            ).toBe(false)
        },
    )

    it('should return false if the device is null', () => {
        expect(isDeviceReady(null)).toBe(false)
    })
})
