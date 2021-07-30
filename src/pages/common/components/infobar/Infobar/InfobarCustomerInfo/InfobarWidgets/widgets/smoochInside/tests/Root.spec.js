import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {TitleWrapper} from '../Root.tsx'

describe('<TitleWrapper/>', () => {
    describe('render()', () => {
        it('should render without link', () => {
            const component = shallow(
                <TitleWrapper source={fromJS({})} template={fromJS({})}>
                    <span>Chat</span>
                </TitleWrapper>
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with a link', () => {
            const component = shallow(
                <TitleWrapper
                    source={fromJS({baz: 'BAZ'})}
                    template={fromJS({
                        meta: {link: 'https://foo.bar/?baz={{baz}}'},
                    })}
                >
                    <span>Chat</span>
                </TitleWrapper>
            )

            expect(component).toMatchSnapshot()
        })
    })
})
