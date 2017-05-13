import React from 'react'
import renderer from 'react-test-renderer'
import ErrorMessage from '../ErrorMessage'

describe('ErrorMessage component', () => {
    it('empty', () => {
        const component = renderer.create(
            <ErrorMessage/>
        ).toJSON()
        expect(component).toEqual(null);
    })
    it('empty string', () => {
        const component = renderer.create(
            <ErrorMessage errors={''}/>
        ).toJSON()
        expect(component).toEqual(null);
    })
    it('simple message', () => {
        const component = renderer.create(
            <ErrorMessage errors={'error'}/>
        ).toJSON()
        expect(component).toMatchSnapshot()
    })
    it('is warning', () => {
        const component = renderer.create(
            <ErrorMessage errors={'warning'} iswarning/>
        ).toJSON()
        expect(component).toMatchSnapshot()
    })
    it('inline warning', () => {
        const component = renderer.create(
            <ErrorMessage errors={'warning'} inline iswarning/>
        ).toJSON()
        expect(component).toMatchSnapshot()
    })

    it('multiple errors', () => {
        const component = renderer.create(
            <ErrorMessage errors={['error1', 'error2']}/>
        ).toJSON()
        expect(component).toMatchSnapshot()
    })


})
