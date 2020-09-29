import {mount} from 'enzyme'
import {Map} from 'immutable'
import _noop from 'lodash/noop'
import React from 'react'
import {InferThunkActionCreatorType} from 'react-redux'

import MultiSelectOptionsField from '../../../forms/MultiSelectOptionsField/index.js'
import {FilterMultiSelectField} from '../FilterMultiSelectField'
import {fieldEnumSearch} from '../../../../../state/views/actions'
import {Option} from '../../../forms/MultiSelectOptionsField/types'

describe('FilterMultiSelectField', () => {
    const defaultProps = {
        plural: 'foos',
        singular: 'foo',
        selectedOptions: [],
        onChange: _noop,
        field: Map(),
        fieldEnumSearchCancellable: () => Promise.resolve(),
        cancelFieldEnumSearchCancellable: _noop,
        mapSearchResults: () => [],
    }

    it('should search for the values on mount', () => {
        const fieldEnumSearchSpy = (jest.fn() as jest.MockedFunction<
            InferThunkActionCreatorType<typeof fieldEnumSearch>
        >).mockResolvedValue(null)
        mount(
            <FilterMultiSelectField
                {...defaultProps}
                fieldEnumSearchCancellable={fieldEnumSearchSpy}
            />
        )
        expect(fieldEnumSearchSpy).toBeCalled()
    })

    // https://github.com/facebook/jest/issues/3465
    it.skip('should debounce search on input change', () => {
        type OnInputChange = (name: string) => void
        const fieldEnumSearchSpy = (jest.fn() as jest.MockedFunction<
            InferThunkActionCreatorType<typeof fieldEnumSearch>
        >).mockResolvedValue(null)
        const wrapper = mount(
            <FilterMultiSelectField
                {...defaultProps}
                fieldEnumSearchCancellable={fieldEnumSearchSpy}
            />
        )
        ;(wrapper
            .find(MultiSelectOptionsField)
            .prop('onInputChange') as OnInputChange)('foo')
        ;(wrapper
            .find(MultiSelectOptionsField)
            .prop('onInputChange') as OnInputChange)('bar')
        ;(wrapper
            .find(MultiSelectOptionsField)
            .prop('onInputChange') as OnInputChange)('baz')
        jest.runAllTimers()
        expect(fieldEnumSearchSpy).toHaveBeenCalledTimes(2) // two times, because first time on mount
        expect(fieldEnumSearchSpy).toHaveBeenLastCalledWith(Map(), 'baz')
    })

    it('should reset search on change', () => {
        const fieldEnumSearchSpy = (jest.fn() as jest.MockedFunction<
            InferThunkActionCreatorType<typeof fieldEnumSearch>
        >).mockResolvedValue(null)
        const wrapper = mount(
            <FilterMultiSelectField
                {...defaultProps}
                fieldEnumSearchCancellable={fieldEnumSearchSpy}
            />
        )
        ;((wrapper
            .find(MultiSelectOptionsField)
            .prop('onChange') as unknown) as (options: Option[]) => void)([])
        expect(fieldEnumSearchSpy).toHaveBeenCalledTimes(2) // first time on mount
    })
})
