import expect from 'expect'
import React from 'react'
import jsdom from 'mocha-jsdom'
import {Map, fromJS} from 'immutable'
import TestUtils from 'react-addons-test-utils'
import ViewFilters, {CallExpression} from '../ViewFilters'

const openapi = require('../../../../fixtures/openapi.json')
const openTicketsView = require('../../../../fixtures/open_tickets_view.json')


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
        jsdom()
        it('null with undefined props', () => {
            const {output} = setup()
            expect(output).toBe(null)
        })
        it('message with empty props', () => {
            const {output} = setup({
                view: Map(),
                schemas: Map({x: 1})
            })
            expect(output).toEqual(<div className="no-filters">No filters selected</div>)
        })
        it('open tickets - ok', () => {
            const props = {
                view: fromJS(openTicketsView),
                schemas: fromJS(openapi)
            }
            const {output} = setup(props)
            expect(output.type).toBe(CallExpression)
            TestUtils.renderIntoDocument(output)
            // todo(@xarg): check that document has the relevant dom
        })
    })
})
