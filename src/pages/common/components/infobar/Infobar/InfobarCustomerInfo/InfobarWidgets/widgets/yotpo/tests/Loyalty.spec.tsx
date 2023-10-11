import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'

import Loyalty from '../../yotpo/Loyalty'

const TitleWrapper = Loyalty().TitleWrapper

describe('<TitleWrapper/>', () => {
    describe('render()', () => {
        it('should render loyalty point balance', () => {
            const {container} = render(
                <TitleWrapper
                    source={fromJS({
                        point_balance: 1,
                    })}
                ></TitleWrapper>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
        it('should not render loyalty point balance', () => {
            const {container} = render(
                <TitleWrapper source={fromJS({})}></TitleWrapper>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
