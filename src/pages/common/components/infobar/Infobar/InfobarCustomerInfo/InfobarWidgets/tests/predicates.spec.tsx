import {fromJS} from 'immutable'

import {infobarWidgetShouldRender} from '../predicates'

describe('infobarWidgetShouldRender()', () => {
    const invalidSources = [
        undefined,
        null,
        false,
        '',
        {},
        {foo: 'bar'},
        {isEmpty: 'foo'},
        fromJS({}),
    ]

    it.each(invalidSources)(
        'should return false because source is invalid',
        (source) => {
            const result = infobarWidgetShouldRender(source)
            expect(result).toBe(false)
        }
    )

    it('should return true because source is valid', () => {
        const source = fromJS({foo: 'bar'})
        const result = infobarWidgetShouldRender(source)
        expect(result).toBe(true)
    })
})
