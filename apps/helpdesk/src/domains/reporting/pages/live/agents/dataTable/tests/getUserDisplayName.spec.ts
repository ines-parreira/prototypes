import { getUserDisplayName } from 'domains/reporting/pages/live/agents/dataTable/utils/getUserDisplayName'

describe('getUserDisplayName', () => {
    it('prefers the full name', () => {
        expect(
            getUserDisplayName({
                name: 'Ada Lovelace',
                firstname: 'Ada',
                lastname: 'Lovelace',
                email: 'ada@example.com',
            }),
        ).toBe('Ada Lovelace')
    })

    it('falls back to first and last name', () => {
        expect(
            getUserDisplayName({
                firstname: 'Ada',
                lastname: 'Lovelace',
                email: 'ada@example.com',
            }),
        ).toBe('Ada Lovelace')
    })

    it('falls back to the email', () => {
        expect(getUserDisplayName({ email: 'ada@example.com' })).toBe(
            'ada@example.com',
        )
    })

    it('falls back to a placeholder when nothing is available', () => {
        expect(getUserDisplayName({})).toBe('Unknown agent')
    })
})
