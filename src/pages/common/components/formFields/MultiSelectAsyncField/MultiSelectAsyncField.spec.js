import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import MultiSelectAsyncField from './'

function setup(props) {
    const renderer = TestUtils.createRenderer()
    renderer.render(<MultiSelectAsyncField {...props} />)
    const output = renderer.getRenderOutput()

    return {
        props,
        output,
        renderer
    }
}

describe('MultiSelectAsyncField component', () => {
    it('empty items', () => {
        const {output} = setup({
            input: {
                value: [],
            },
        })

        expect(output.props.children[0].props.children[0].length).toEqual(0)
    })

    it('multiple items correct amount', () => {
        const values = [{
            label: 'Michel',
        }, {
            label: 'Lucien',
        }]

        const {output} = setup({
            input: {
                value: values,
            },
        })

        expect(output.props.children[0].props.children[0].length).toEqual(2)
    })

    it('multiple items correct content', () => {
        const values = [{
            label: 'Michel',
        }, {
            label: 'Lucien',
        }]

        const {output} = setup({
            input: {
                value: values,
            },
        })

        output.props.children[0].props.children[0].forEach((item, index) => {
            expect(item.props.children[0].props.children).toEqual(values[index].label)
        })
    })
})
