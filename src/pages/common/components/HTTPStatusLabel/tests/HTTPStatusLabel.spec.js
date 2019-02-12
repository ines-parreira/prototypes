import {shallow} from 'enzyme'
import React from 'react'

import HTTPStatusLabel from '../HTTPStatusLabel'

describe('HTTPStatusLabel', () => {
    it('should render a secondary label for unknown HTTP status code', () => {
        const component = shallow(<HTTPStatusLabel statusCode={78}/>)
        expect(component).toMatchSnapshot()
    })

    it('should render a secondary label for 1xx HTTP status code', () => {
        const component = shallow(<HTTPStatusLabel statusCode={100}/>)
        expect(component).toMatchSnapshot()
    })

    it('should render a success label for 2xx HTTP status code', () => {
        const component = shallow(<HTTPStatusLabel statusCode={200}/>)
        expect(component).toMatchSnapshot()
    })

    it('should render a primary label for 3xx HTTP status code', () => {
        const component = shallow(<HTTPStatusLabel statusCode={300}/>)
        expect(component).toMatchSnapshot()
    })

    it('should render a danger label for 4xx HTTP status code', () => {
        const component = shallow(<HTTPStatusLabel statusCode={400}/>)
        expect(component).toMatchSnapshot()
    })

    it('should render a danger label for 5xx HTTP status code', () => {
        const component = shallow(<HTTPStatusLabel statusCode={500}/>)
        expect(component).toMatchSnapshot()
    })
})
