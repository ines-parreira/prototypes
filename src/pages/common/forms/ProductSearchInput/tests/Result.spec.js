// @flow

import React from 'react'
import {shallow} from 'enzyme'

import Result from '../Result'

describe('<Result/>', () => {
    describe('render()', () => {
        it('should render with image and subtitle', () => {
            const component = shallow(
                <Result
                    title="Title"
                    image={{src: 'https://foo.bar/image.jpg', alt: 'alt'}}
                    subtitle="Subtitle"
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with default image', () => {
            const component = shallow(
                <Result
                    title="Title"
                    image={null}
                    subtitle="Subtitle"
                />
            )

            expect(component).toMatchSnapshot()
        })
        it('should render without subtitle', () => {
            const component = shallow(
                <Result
                    title="Title"
                    image={{src: 'https://foo.bar/image.jpg', alt: 'alt'}}
                    subtitle={null}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
