import {getCategoryDndType} from '../getCategoryDndType'

describe('getCategoryDndType', () => {
    it('should return DndType based on category id', () => {
        expect(getCategoryDndType(null)).toEqual('CATEGORY')
        expect(getCategoryDndType(0)).toEqual('CATEGORY')
        expect(getCategoryDndType(6)).toEqual('CATEGORY6')
    })
})
