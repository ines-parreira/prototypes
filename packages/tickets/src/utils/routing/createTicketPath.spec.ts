import {
    CreateTicketSearchParamsKeys,
    getCreateTicketPathWithPreviousURL,
    isCreateTicketPath,
} from './createTicketPath'

describe('createTicketPath', () => {
    it('builds the create ticket path with the encoded previousURL', () => {
        expect(
            getCreateTicketPathWithPreviousURL({
                pathname: '/app/views/42',
                search: '?cursor=next',
                hash: '#ticket-list',
            }),
        ).toBe(
            '/app/ticket/new?previousURL=%2Fapp%2Fviews%2F42%3Fcursor%3Dnext%23ticket-list',
        )
    })

    it('identifies create ticket paths', () => {
        expect(isCreateTicketPath('/app/ticket/new')).toBe(true)
        expect(isCreateTicketPath('/app/ticket/new/draft')).toBe(true)
        expect(isCreateTicketPath('/app/ticket/123')).toBe(false)
        expect(isCreateTicketPath('/app/ticket/newer')).toBe(false)
    })

    it('parses previousURL search params into router redirect paths', () => {
        const { parse } = CreateTicketSearchParamsKeys.previousURL

        expect(parse('/app/views/42?cursor=next#ticket-list')).toBe(
            '/app/views/42?cursor=next#ticket-list',
        )
    })

    it('drops unsafe previousURL search params', () => {
        const { parse } = CreateTicketSearchParamsKeys.previousURL

        expect(parse(null)).toBeUndefined()
        expect(parse('')).toBeUndefined()
        expect(parse('/app/ticket/new')).toBeUndefined()
        expect(parse('/app/ticket/new/draft')).toBeUndefined()
        expect(parse('/app/ticket/new?from=views')).toBeUndefined()
        expect(parse('https://example.com/app/views/42')).toBeUndefined()
        expect(parse('//example.com/app/views/42')).toBeUndefined()
    })
})
