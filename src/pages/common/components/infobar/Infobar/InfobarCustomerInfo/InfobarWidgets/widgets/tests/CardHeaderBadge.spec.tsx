import React from 'react'
import {shallow} from 'enzyme'

import {CardHeaderBadge} from '../CardHeaderBadge'

describe('<CardHeaderBadge/>', () => {
    describe('render()', () => {
        it.each(['visibilty', 'visibilty_off', 'star'])(
            'should render with material icons',
            (iconName) => {
                const component = shallow(
                    <CardHeaderBadge iconName={iconName} />
                )

                expect(component).toMatchSnapshot()
            }
        )

        it.each(['primary', 'secondary'])(
            'should support primary color',
            (color) => {
                const component = shallow(
                    <CardHeaderBadge iconName="star" color={color}>
                        <p>foo</p>
                        <p>bar</p>
                    </CardHeaderBadge>
                )

                expect(component).toMatchSnapshot()
            }
        )
        it('should render children', () => {
            const component = shallow(
                <CardHeaderBadge iconName="star">
                    <p>foo</p>
                    <p>bar</p>
                </CardHeaderBadge>
            )

            expect(component).toMatchSnapshot()
        })
        it('should support no children', () => {
            const component = shallow(<CardHeaderBadge iconName="star" />)

            expect(component).toMatchSnapshot()
        })
        it('should support css class injection', () => {
            const component = shallow(
                <CardHeaderBadge iconName="star" className="custom-css-class" />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
