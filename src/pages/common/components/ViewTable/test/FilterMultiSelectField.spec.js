// @flow
import {mount} from 'enzyme'
import {Map} from 'immutable'
import _noop from 'lodash/noop'
import React from 'react'

import MultiSelectOptionsField from '../../../forms/MultiSelectOptionsField'
import {FilterMultiSelectField} from '../FilterMultiSelectField'

describe('FilterMultiSelectField', () => {
    const defaultProps = {
        plural: 'foos',
        singular: 'foo',
        selectedOptions: [],
        onChange: _noop,
        field: new Map(),
        fieldEnumSearch: () => new Map(),
        mapSearchResults: () => []
    }

    it('should search for the values on mount', () => {
        const fieldEnumSearchSpy= jest.fn()
        mount(
            <FilterMultiSelectField
                {...defaultProps}
                fieldEnumSearch={fieldEnumSearchSpy}
            />
        )
        expect(fieldEnumSearchSpy).toBeCalled()
    })


    // https://github.com/facebook/jest/issues/3465
    it.skip('should debounce search on input change', () => {
        const fieldEnumSearchSpy= jest.fn()
        const wrapper = mount(
            <FilterMultiSelectField
                {...defaultProps}
                fieldEnumSearch={fieldEnumSearchSpy}
            />
        )
        wrapper.find(MultiSelectOptionsField).prop('onInputChange')('foo')
        wrapper.find(MultiSelectOptionsField).prop('onInputChange')('bar')
        wrapper.find(MultiSelectOptionsField).prop('onInputChange')('baz')
        jest.runAllTimers()
        expect(fieldEnumSearchSpy).toHaveBeenCalledTimes(2)  // two times, because first time on mount
        expect(fieldEnumSearchSpy).toHaveBeenLastCalledWith(new Map(), 'baz')
    })

    it('should reset search on change', () => {
        const fieldEnumSearchSpy= jest.fn()
        const wrapper = mount(
            <FilterMultiSelectField
                {...defaultProps}
                fieldEnumSearch={fieldEnumSearchSpy}
            />
        )
        wrapper.find(MultiSelectOptionsField).prop('onChange')([])
        expect(fieldEnumSearchSpy).toHaveBeenCalledTimes(2) // first time on mount
    })
})
