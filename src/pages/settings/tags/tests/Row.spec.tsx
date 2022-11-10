import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import _noop from 'lodash/noop'
import configureMockStore from 'redux-mock-store'

import {tags} from 'fixtures/tag'

import Row from '../Row'

const mockStore = configureMockStore()

describe('Row', () => {
    const defaultTag = tags[0]
    const defaultMeta = {
        edit: false,
        selected: false,
    }
    const defaultProps: ComponentProps<typeof Row> = {
        row: defaultTag,
        meta: fromJS(defaultMeta),
        refresh: _noop,
    }

    it('should not update state on props change when props row is the same', () => {
        const newName = 'foo'
        const {getByDisplayValue, rerender, queryByDisplayValue} = render(
            <Provider store={mockStore()}>
                <Row
                    {...defaultProps}
                    meta={fromJS({...defaultMeta, edit: true})}
                />
            </Provider>
        )

        fireEvent.change(getByDisplayValue(defaultTag.name), {
            target: {value: newName},
        })
        rerender(
            <Provider store={mockStore()}>
                <Row
                    {...defaultProps}
                    meta={fromJS({...defaultMeta, edit: true})}
                />
            </Provider>
        )

        expect(queryByDisplayValue(newName)).not.toBe(null)
    })
})
