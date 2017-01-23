import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import {Emoji} from '../Emoji'

function setup(props) {
    const renderer = TestUtils.createRenderer()
    renderer.render(<Emoji {...props} />)
    const output = renderer.getRenderOutput()

    return {
        props,
        output,
        renderer
    }
}

describe('Emoji component', () => {
    it('unsupported char', () => {
        const {output} = setup({name: 'x'})
        expect(output).toEqual(<img src="/static/public/img/emoji/72x72/78.png" alt="x" className="emoji" />)
    })

    it('supported emoji char', () => {
        const {output} = setup({name: '👌'})
        expect(output).toEqual(<img src="/static/public/img/emoji/72x72/1f44c.png" alt="👌" className="emoji" />)
    })

    it('supported alias', () => {
        const {output} = setup({name: 'ok_hand'})
        expect(output).toEqual(<img src="/static/public/img/emoji/72x72/1f44c.png" alt="👌" className="emoji" />)
    })
})
