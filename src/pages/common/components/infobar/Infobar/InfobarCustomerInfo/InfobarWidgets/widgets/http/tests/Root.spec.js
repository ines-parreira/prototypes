import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import {TitleWrapper} from '../Root.tsx'

describe('<TitleWrapper/>', () => {
    describe('render()', () => {
        it('should render default', () => {
            const {container} = render(
                <TitleWrapper source={fromJS({})} template={fromJS({})} />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render inline', () => {
            const {container} = render(
                <TitleWrapper
                    source={fromJS({})}
                    isEditing
                    template={fromJS({})}
                />
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
                    <span>Foo</span>
                </TitleWrapper>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with a color tile', () => {
            const {container} = render(
                <TitleWrapper
                    template={fromJS({
                        meta: {color: '#123'},
                    })}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with a custom picture', () => {
            const {container} = render(
                <TitleWrapper
                    template={fromJS({
                        meta: {
                            pictureUrl: 'http://mypictureurl.com',
                            color: '#123',
                        },
                    })}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
