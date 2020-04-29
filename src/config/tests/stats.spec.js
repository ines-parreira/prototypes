import {views} from '../stats'

describe('views()', () => {
    it.each([
        ['old', false],
        ['new', true]]
    )('should return views with the %s revenue view', (_, useNewRevenueStat) => {
        expect(views(useNewRevenueStat)).toMatchSnapshot()
    })
})
