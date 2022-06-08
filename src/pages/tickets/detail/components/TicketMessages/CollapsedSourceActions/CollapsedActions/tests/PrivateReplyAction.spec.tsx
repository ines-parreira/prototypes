import React from 'react'

import _noop from 'lodash/noop'

import {Dropdown} from 'reactstrap'

import {render} from '@testing-library/react'

import {message} from 'models/ticket/tests/mocks'

import PrivateReplyAction from '../PrivateReplyAction'

const renderAction = ({
    isInstagramComment = false,
    isFacebookComment = false,
} = {}) =>
    render(
        <Dropdown toggle={_noop}>
            <PrivateReplyAction
                message={message}
                isInstagramComment={isInstagramComment}
                isFacebookComment={isFacebookComment}
                onClick={_noop}
            />
        </Dropdown>
    )

describe('PrivateReplyAction', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display correct text for instagram comment', () => {
        const {container} = renderAction({
            isInstagramComment: true,
            isFacebookComment: false,
        })
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display correct text for facebook comment', () => {
        const {container} = renderAction({
            isInstagramComment: false,
            isFacebookComment: true,
        })
        expect(container.firstChild).toMatchSnapshot()
    })
})
