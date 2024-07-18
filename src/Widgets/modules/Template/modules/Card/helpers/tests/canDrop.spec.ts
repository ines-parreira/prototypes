import {canDrop} from '../canDrop'

describe('canDrop', () => {
    it('should return false when source doesn’t match target', () => {
        expect(canDrop('source', ['target'])).toBe(false)
    })
    it('should return true when source matches target', () => {
        expect(canDrop('source', ['source'])).toBe(true)
    })
})
