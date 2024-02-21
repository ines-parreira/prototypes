import {updateRecord} from '../types'

describe('updateRecord', () => {
    it('should update value of the given object at the given key accordingly with the given value', () => {
        const record = {a: 1, b: 2}
        updateRecord(record, 'a', 3)
        expect(record).toEqual({a: 3, b: 2})
    })
})
