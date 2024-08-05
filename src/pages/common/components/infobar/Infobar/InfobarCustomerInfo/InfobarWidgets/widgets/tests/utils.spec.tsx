import {getOptionsFromTags} from '../utils'
import {Option} from '../../../../../../../forms/MultiSelectOptionsField/types'

describe('getOptionsFromTags()', () => {
    it('should get options from tags list', () => {
        const tags: string[] = ['test1', 'test2']
        const output: Option[] = [
            {label: 'test1', value: 'test1'},
            {label: 'test2', value: 'test2'},
        ]
        expect(getOptionsFromTags(tags)).toEqual(output)
    })
})
