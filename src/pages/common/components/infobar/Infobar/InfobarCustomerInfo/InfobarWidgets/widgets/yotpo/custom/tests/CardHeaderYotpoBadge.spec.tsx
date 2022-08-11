import React from 'react'
import {shallow} from 'enzyme'

import {CardHeaderYotpoBadge} from '../CardHeaderYotpoBadge'

describe('<CardHeaderYotpoBadge/>', () => {
    describe('render()', () => {
        it.each(['visibilty', 'visibilty_off', 'star'])(
            'should render with material icons',
            (iconName) => {
                const component = shallow(
                    <CardHeaderYotpoBadge iconName={iconName} />
                )

                expect(component).toMatchSnapshot()
            }
        )

        it.each(['primary', 'secondary'])(
            'should support primary color',
            (color) => {
                const component = shallow(
                    <CardHeaderYotpoBadge iconName="star" color={color}>
                        <p>foo</p>
                        <p>bar</p>
                    </CardHeaderYotpoBadge>
                )

                expect(component).toMatchSnapshot()
            }
        )
        it('should render children', () => {
            const component = shallow(
                <CardHeaderYotpoBadge iconName="star">
                    <p>foo</p>
                    <p>bar</p>
                </CardHeaderYotpoBadge>
            )

            expect(component).toMatchSnapshot()
        })
        it('should support no children', () => {
            const component = shallow(<CardHeaderYotpoBadge iconName="star" />)

            expect(component).toMatchSnapshot()
        })
        it('should support css class injection', () => {
            const component = shallow(
                <CardHeaderYotpoBadge
                    iconName="star"
                    className="custom-css-class"
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
