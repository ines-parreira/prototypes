import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import InputColor from '../InputColor'

function setup(props) {
    const renderer = TestUtils.createRenderer()
    renderer.render(<InputColor {...props} />)
    const output = renderer.getRenderOutput()

    return {
        props,
        output,
        renderer
    }
}

describe('InputColor component', () => {
    it('without value', () => {
        const {output} = setup()
        expect(output.props.children.some((child) => {
            return (child.type === 'input' &&
                child.props.type === 'text' &&
                child.props.value === '')
        })).toBe(true)
    })

    it('with value', () => {
        const value = 'mock value'
        const {output} = setup({
            value
        })
        expect(output.props.children.some((child) => {
            return (child.type === 'input' &&
                child.props.type === 'text' &&
                child.props.value === value)
        })).toBe(true)
    })
})
