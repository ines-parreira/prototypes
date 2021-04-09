import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import React from 'react'

import Loyalty from '../../yotpo/Loyalty.tsx'

const TitleWrapper = Loyalty().TitleWrapper

describe('<TitleWrapper/>', () => {
    describe('render()', () => {
        it('should render loyalty point balance', () => {
            const component = shallow(
                <TitleWrapper
                    source={fromJS({
                        point_balance: 1,
                    })}
                ></TitleWrapper>
            )

            expect(component).toMatchSnapshot()
        })
        it('should not render loyalty point balance', () => {
            const component = shallow(
                <TitleWrapper source={fromJS({})}></TitleWrapper>
            )

            expect(component).toMatchSnapshot()
        })
    })
})
