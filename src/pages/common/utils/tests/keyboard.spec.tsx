import * as utils from '../keyboard'

describe('keyboard utils', () => {
    describe('moveIndex', () => {
        it('should return next index', () => {
            expect(utils.moveIndex(0, 2)).toEqual(1)
        })

        it('should return previous index', () => {
            expect(
                utils.moveIndex(1, 1, {
                    direction: utils.MoveIndexDirection.Prev,
                })
            ).toEqual(0)
        })

        it('should return same index', () => {
            expect(utils.moveIndex(0, 0)).toEqual(0)
            expect(
                utils.moveIndex(0, 0, {
                    direction: utils.MoveIndexDirection.Prev,
                })
            ).toEqual(0)
        })
    })
})
