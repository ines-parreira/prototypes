import { ldClientMock } from '@repo/feature-flags/testing'

export function initLaunchDarkly() {
    return ldClientMock
}

export function getLDClient() {
    return ldClientMock
}
