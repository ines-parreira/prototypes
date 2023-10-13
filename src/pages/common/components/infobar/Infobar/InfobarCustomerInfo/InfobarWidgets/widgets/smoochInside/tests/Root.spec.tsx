import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import {TitleWrapper} from '../Root'

describe('<TitleWrapper/>', () => {
    describe('render()', () => {
        it('should render without link', () => {
            const {container} = render(
                <TitleWrapper source={fromJS({})} template={fromJS({})}>
                    <span>Chat</span>
                </TitleWrapper>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with a link', () => {
            const {container} = render(
                <TitleWrapper
                    source={fromJS({baz: 'BAZ'})}
                    template={fromJS({
                        meta: {link: 'https://foo.bar/?baz={{baz}}'},
                    })}
                >
                    <span>Chat</span>
                </TitleWrapper>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
