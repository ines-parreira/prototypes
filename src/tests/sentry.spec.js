import * as Sentry from '@sentry/react'

import initSentry from '../sentry'

const mockSentryScopeSpy = {
    setUser: jest.fn(),
    setTag: jest.fn(),
}

jest.mock('@sentry/react', () => {
    return {
        init: jest.fn(),
        configureScope: jest.fn((func) => {
            func(mockSentryScopeSpy)
        }),
    }
})
describe('initSentry()', () => {
    it('should init Sentry with the given config', () => {
        const config = {
            release: 'v12.23.4',
            environment: 'testing',
            dsn: 'https://fake.sentry.com/dsn',
            currentUser: {
                id: 1,
                account_id: 3,
                name: 'Steve',
                email: 'steve@example.com',
            },
            currentAccount: {
                domain: 'acme',
            },
        }
        initSentry(config)
        expect(Sentry.init.mock.calls).toMatchSnapshot()
        expect(mockSentryScopeSpy.setTag).toMatchSnapshot()
        expect(mockSentryScopeSpy.setUser).toMatchSnapshot()
    })
})
