import expect from 'expect'
import React from 'react'
import {fromJS} from 'immutable'
import TestUtils from 'react-addons-test-utils'
import {BlankState} from '../components/BlankState'

function setup(props) {
    const renderer = TestUtils.createRenderer()
    renderer.render(<BlankState {...props} />)
    const output = renderer.getRenderOutput()

    return {
        props,
        output,
        renderer
    }
}

describe('BlankState component', () => {
    it('default with undefined props', () => {
        const {output} = setup()
        expect(output).toEqual(<div className="blank-state"><div>This view is empty. Enjoy your day!</div></div>)
    })

    it('custom message', () => {
        const {output} = setup({
            message: <div>Custom message</div>
        })
        expect(output).toEqual(<div className="blank-state"><div>Custom message</div></div>)
    })

    it('more than 10 tickets closed', () => {
        const {output} = setup({
            stats: fromJS({
                agents: [['Alex', 11]]
            })
        })
        expect(output.props.children.props.children[1].props.children).toEqual('No more tickets here!')
    })

    it('more than 100 tickets closed', () => {
        const {output} = setup({
            stats: fromJS({
                agents: [['Alex', 101]]
            })
        })
        expect(output.props.children.props.children[1].props.children).toEqual('Done!')
    })

    it('more than 500 tickets closed', () => {
        const {output} = setup({
            stats: fromJS({
                agents: [['Alex', 501]]
            })
        })
        expect(output.props.children.props.children[1].props.children).toEqual('All good!')
    })
})
