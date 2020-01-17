import {notifyDeprecatedTld} from '../init'
import {notify} from '../state/notifications/actions'

jest.mock('../state/notifications/actions', () => {
    return {
        notify: jest.fn()
    }
})

describe('notifyDeprecatedTld()', () => {
    const reduxStore = {
        dispatch: jest.fn()
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should not do anything because the URL\'s TLD is not `.io`', () => {
        notifyDeprecatedTld('https://acme.gorgias.com/', reduxStore)
        expect(notify).not.toHaveBeenCalled()
    })

    it('should dispatch a notification because the URL\'s TLD is `.io`', () => {
        notifyDeprecatedTld('https://acme.gorgias.io/', reduxStore)
        expect(notify.mock.calls).toMatchSnapshot()
    })
})
