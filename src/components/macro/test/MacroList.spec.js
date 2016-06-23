import React from 'react'
import ReactDOM from 'react-dom'
import TestUtils from 'react-addons-test-utils'
import expect from 'expect'
import expectImmutable from 'expect-immutable'

import {fromJS} from 'immutable'
import MacroList from '../MacroList'

expect.extend(expectImmutable)

describe('MacroList component with external actions', () => {
    let component

    const macros = fromJS([
        { id: 1, name: 'macro1' },
        { id: 2, name: 'macro2' },
        { id: 3, name: 'macro3' }
    ])

    const currentMacro = fromJS({ id: 2, name: 'macro2' })

    const actions = {
        previewMacroInModal: () => {},
        saveSearch: () => {},
        addNewMacro: () => {}
    }

    before('render element', () => {
        const renderer = TestUtils.createRenderer()

        renderer.render(
            <MacroList
                macros={macros}
                currentMacro={currentMacro}
                actions={actions}
            />
        )

        component = renderer.getRenderOutput()
    })

    it('should display all the macros', () => {
        const macrosList = component.props.children[0].props.children[1]
        expect(macrosList.length).toBe(3)
    })

    it('should set the currentMacro as active', () => {
        const activeItem = component.props.children[0].props.children[1].find(
            macro => macro.key === currentMacro.get('id').toString()
        )

        expect(activeItem.props.className).toInclude('item')
        expect(activeItem.props.className).toInclude('active')
    })

    it('should save search query in the state when updated', () => {
        const mountedComponent = TestUtils.renderIntoDocument(
            <MacroList
                macros={macros}
                currentMacro={currentMacro}
                actions={actions}
            />
        )

        const spyMethod = expect.spyOn(mountedComponent, 'setState')
        const searchInput = ReactDOM.findDOMNode(mountedComponent.refs.search).querySelector('input')

        TestUtils.Simulate.change(searchInput, {target: {value: 'macro1'}}) // set the value of the input
        mountedComponent.refs.search.props.onChange({target: {value: 'macro1'}}) // and call the callback

        expect(searchInput.value).toBe('macro1')
        expect(spyMethod).toHaveBeenCalled()
    })
})
