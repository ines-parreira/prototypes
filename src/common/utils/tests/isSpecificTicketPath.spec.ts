import isSpecificTicketPath from '../isSpecificTicketPath'

describe('isSpecificTicketPath', () => {
    it('should return true for a full-width ticket path', () => {
        const result = isSpecificTicketPath('/app/ticket/123456', 123456)
        expect(result).toBe(true)
    })

    it('should return true for a split ticket view path', () => {
        const result = isSpecificTicketPath('/app/views/654321/123456', 123456)
        expect(result).toBe(true)
    })

    it.each([
        '/app/views/654321/123457',
        '/app/views/654321',
        '/app/ticket/123457',
        '/app/tickets/654321',
        '/app/tickets',
    ])(
        'should return false if the given path is not for the given ticket',
        (path) => {
            const result = isSpecificTicketPath(path, 123456)
            expect(result).toBe(false)
        },
    )
})
