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
        expect(output).toEqual(<div className="blank-state"><p>This view is empty. Enjoy your day!</p></div>)
    })

    it('custom message', () => {
        const {output} = setup({
            message: <p>Custom message</p>
        })
        expect(output).toEqual(<div className="blank-state"><p>Custom message</p></div>)
    })

    it('null when loading', () => {
        const {output} = setup({
            stats: fromJS({
                _internal: {
                    loading: {
                        stats: true
                    }
                }
            })
        })
        expect(output).toEqual(null)
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
