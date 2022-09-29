const clientMock = {
    allFlags: jest.fn().mockReturnValue({}),
}

export function initLaunchDarkly() {
    return clientMock
}

export function getLDClient() {
    return clientMock
}
