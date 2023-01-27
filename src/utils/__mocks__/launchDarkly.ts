import {ldClientMock} from 'jest-launchdarkly-mock'

export function initLaunchDarkly() {
    return ldClientMock
}

export function getLDClient() {
    return ldClientMock
}
