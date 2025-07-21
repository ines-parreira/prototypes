import { getPreviousMonthRange } from 'domains/reporting/pages/convert/utils/getPreviousMonthRange'

jest.useFakeTimers().setSystemTime(new Date('2020-02-02'))

describe('getPreviousMonthRange', () => {
    it('generates correct previous month range', () => {
        const [startDate, endDate] = getPreviousMonthRange()

        expect(startDate).toBe('2020-01-01T00:00:00.000Z')
        expect(endDate).toBe('2020-01-31T23:59:59.999Z')
    })
})
