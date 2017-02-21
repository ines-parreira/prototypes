import expect from 'expect'
import React from 'react'
import {fromJS} from 'immutable'
import TestUtils from 'react-addons-test-utils'
import {ViewFilters} from '../Filters/ViewFilters'

function setup(props) {
    const renderer = TestUtils.createRenderer()
    renderer.render(<ViewFilters {...props} />)
    const output = renderer.getRenderOutput()

    return {
        props,
        output,
        renderer
    }
}

describe('components', () => {
    describe('ViewFilters', () => {
        it('null with undefined props', () => {
            const {output} = setup()
            expect(output).toBe(null)
        })
        it('message with empty props', () => {
            const {output} = setup({
                view: fromJS({}),
                schemas: fromJS({x: 1})
            })
            expect(output).toEqual(<div className="no-filters">No filters selected</div>)
        })
    })
})
