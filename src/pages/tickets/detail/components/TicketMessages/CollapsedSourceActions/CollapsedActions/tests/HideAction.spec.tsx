import React from 'react'

import _noop from 'lodash/noop'

import {Dropdown} from 'reactstrap'

import {render} from '@testing-library/react'

import HideAction from '../HideAction'

const renderAction = ({shouldHide = false, isInstagramComment = false} = {}) =>
    render(
        <Dropdown toggle={_noop}>
            <HideAction
                shouldHide={shouldHide}
                isInstagramComment={isInstagramComment}
                toggleHideComment={_noop}
            />
        </Dropdown>
    )

describe('HideAction', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display correct text for hiding instagram comment', () => {
        const {container} = renderAction({
            shouldHide: true,
            isInstagramComment: true,
        })
        expect(container.querySelector('.content')).toMatchSnapshot()
    })

    it('should display correct text for unhiding non-instagram comment', () => {
        const {container} = renderAction({
            shouldHide: false,
            isInstagramComment: false,
        })
        expect(container.querySelector('.content')).toMatchSnapshot()
    })
})
