import {
    buildGuidanceContextAttachment,
    buildSkillContextAttachment,
    buildTicketContextAttachment,
} from './contextAttachmentBuilders'

describe('contextAttachmentBuilders', () => {
    describe('buildTicketContextAttachment', () => {
        it('builds a ticket attachment when the loaded ticket matches the route', () => {
            expect(
                buildTicketContextAttachment({
                    id: 123,
                    routeTicketId: 123,
                    subject: 'Refund request',
                }),
            ).toEqual({
                kind: 'ticket',
                id: '123',
                title: 'Refund request',
            })
        })

        it('uses a fallback title for tickets without a subject', () => {
            expect(
                buildTicketContextAttachment({
                    id: 123,
                    routeTicketId: 123,
                    subject: '   ',
                }),
            ).toEqual({
                kind: 'ticket',
                id: '123',
                title: 'Ticket #123',
            })
        })

        it('does not build a ticket attachment while route and loaded ticket differ', () => {
            expect(
                buildTicketContextAttachment({
                    id: 456,
                    routeTicketId: 123,
                    subject: 'Refund request',
                }),
            ).toBeUndefined()
        })
    })

    it('builds a guidance attachment with help center context', () => {
        expect(
            buildGuidanceContextAttachment({
                id: 7,
                title: 'Shipping guidance',
                helpCenterId: 55,
            }),
        ).toEqual({
            kind: 'guidance',
            id: '7',
            title: 'Shipping guidance',
            helpCenterId: '55',
        })
    })

    it('builds a skill attachment with help center context', () => {
        expect(
            buildSkillContextAttachment({
                id: 8,
                title: 'Cancel order',
                helpCenterId: 55,
            }),
        ).toEqual({
            kind: 'skill',
            id: '8',
            title: 'Cancel order',
            helpCenterId: '55',
        })
    })

    it('does not build help center attachments without a help center id', () => {
        expect(
            buildGuidanceContextAttachment({
                id: 7,
                title: 'Shipping guidance',
                helpCenterId: undefined,
            }),
        ).toBeUndefined()
    })
})
