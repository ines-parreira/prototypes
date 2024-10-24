import {Template} from 'models/widget/types'

import {isDefaultOpen} from '../isDefaultOpen'

describe('isDefaultOpen', () => {
    const parentTemplate = {} as Template
    it.each([
        [{isEditing: false}, true],
        [{isEditing: false, parentTemplate}, false],
        [{isEditing: true}, true],
        [{isEditing: true, parentTemplate}, true],
        [{isEditing: false, isFirstOfList: true}, true],
        [{isEditing: false, parentTemplate, isFirstOfList: false}, false],
    ])(
        'should return true or false based on the given arguments',
        (params, expectedReturn) => {
            expect(isDefaultOpen(params)).toBe(expectedReturn)
        }
    )
})
