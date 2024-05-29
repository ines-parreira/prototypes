import React from 'react'

import {render} from '@testing-library/react'
import {CardHeaderYotpoBadge} from '../CardHeaderYotpoBadge'

describe('<CardHeaderYotpoBadge/>', () => {
    describe('render()', () => {
        it.each(['visibilty', 'visibilty_off', 'star'])(
            'should render with material icons',
            (iconName) => {
                const {container} = render(
                    <CardHeaderYotpoBadge iconName={iconName} />
                )

                expect(container.firstChild).toMatchSnapshot()
            }
        )

        it.each(['primary', 'secondary'])(
            'should support primary color',
            (color) => {
                const {container} = render(
                    <CardHeaderYotpoBadge iconName="star" color={color}>
                        <p>foo</p>
                        <p>bar</p>
                    </CardHeaderYotpoBadge>
                )

                expect(container.firstChild).toMatchSnapshot()
            }
        )
        it('should render children', () => {
            const {container} = render(
                <CardHeaderYotpoBadge iconName="star">
                    <p>foo</p>
                    <p>bar</p>
                </CardHeaderYotpoBadge>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
        it('should support no children', () => {
            const {container} = render(<CardHeaderYotpoBadge iconName="star" />)

            expect(container.firstChild).toMatchSnapshot()
        })
        it('should support css class injection', () => {
            const {container} = render(
                <CardHeaderYotpoBadge
                    iconName="star"
                    className="custom-css-class"
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
