import React from 'react'
import renderer from 'react-test-renderer'
import {Emoji} from '../Emoji'

describe('Emoji component', () => {
    it('unsupported char', () => {
        const component = renderer.create(
            <Emoji name={'x'}/>
        ).toJSON()
        expect(component).toMatchSnapshot()
    })

    it('supported emoji char', () => {
        const component = renderer.create(
            <Emoji name={'👌'}/>
        ).toJSON()
        expect(component).toMatchSnapshot()
    })

    it('supported alias', () => {
        const component = renderer.create(
            <Emoji name={'ok_hand'}/>
        ).toJSON()
        expect(component).toMatchSnapshot()
    })
})
