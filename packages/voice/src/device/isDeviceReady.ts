import type { Device } from '@twilio/voice-sdk'

export const isDeviceReady = (device?: Device | null): boolean => {
    return device?.state === 'registered'
}
