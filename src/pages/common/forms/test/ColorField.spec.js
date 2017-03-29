import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import ColorField from '../ColorField'

function setup(props) {
    const renderer = TestUtils.createRenderer()
    renderer.render(<ColorField {...props} />)
    const output = renderer.getRenderOutput()

    return {
        props,
        output,
        renderer
    }
}

describe('ColorField component', () => {
    it('without value', () => {
        const {output} = setup({
            input: {}
        })
        expect(output.props.children[1].props.children.some((child) => {
            return (child.type === 'input' &&
                child.props.type === 'text' &&
                !child.props.value)
        })).toBe(true)
    })

    it('with value', () => {
        const value = 'mock value'
        const {output} = setup({
            input: {
                value
            }
        })
        expect(output.props.children[1].props.children.some((child) => {
            return (child.type === 'input' &&
                child.props.type === 'text' &&
                child.props.value === value)
        })).toBe(true)
    })
})
