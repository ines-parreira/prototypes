import { history } from '@repo/routing'

import goToTicket from 'common/utils/goToTicket'

jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        push: jest.fn(),
    },
}))

describe('goToTicket', () => {
    it('should push to /app/views/:viewId/:ticketId if viewId param is present', () => {
        window.location.pathname = '/app/views/1'

        goToTicket(123)

        expect(history.push).toHaveBeenCalledWith('/app/views/1/123')
    })

    it('should push to /app/ticket/:ticketId if viewId param is not present', () => {
        window.location.pathname = '/app/ticket/1'

        goToTicket(123)

        expect(history.push).toHaveBeenCalledWith('/app/ticket/123')
    })
})
