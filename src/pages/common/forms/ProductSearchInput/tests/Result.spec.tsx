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
                    stock={{quantity: 1, tracked: true, totalVariants: 1}}
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
                    stock={{quantity: 1, tracked: true, totalVariants: 1}}
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
                    stock={{quantity: 1, tracked: true, totalVariants: 1}}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render without product stock quantity', () => {
            const component = shallow(
                <Result
                    title="Title"
                    image={{src: 'https://foo.bar/image.jpg', alt: 'alt'}}
                    subtitle="Subtitle"
                    stock={{quantity: 0, tracked: false, totalVariants: 1}}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
