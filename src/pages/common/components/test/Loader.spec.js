import React from 'react'
import renderer from 'react-test-renderer'
import Loader from '../Loader'

describe('Loader component', () => {
    it('simple message', () => {
        const component = renderer.create(
            <Loader message={'hello'}/>
        ).toJSON()
        expect(component).toMatchSnapshot()
    })

    it('inline', () => {
        const component = renderer.create(
            <Loader inline/>
        ).toJSON()
        expect(component).toMatchSnapshot()
    })

    it('loading', () => {
        const component = renderer.create(
            <Loader loading/>
        ).toJSON()
        expect(component).toMatchSnapshot()
    })

    it('not loading', () => {
        const component = renderer.create(
            <Loader loading={false}/>
        ).toJSON()
        expect(component).toMatchSnapshot()
    })

    it('size', () => {
        const component = renderer.create(
            <Loader size="large"/>
        ).toJSON()
        expect(component).toMatchSnapshot()
    })
})
