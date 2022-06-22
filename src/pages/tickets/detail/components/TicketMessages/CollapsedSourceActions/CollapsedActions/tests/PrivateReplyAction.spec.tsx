import React from 'react'

import _noop from 'lodash/noop'

import {Dropdown} from 'reactstrap'

import {render} from '@testing-library/react'

import {message} from 'models/ticket/tests/mocks'

import PrivateReplyAction from '../PrivateReplyAction'

const renderAction = ({isFacebookComment = false} = {}) =>
    render(
        <Dropdown toggle={_noop}>
            <PrivateReplyAction
                message={message}
                isFacebookComment={isFacebookComment}
                onClick={_noop}
            />
        </Dropdown>
    )

describe('<PrivateReplyAction/>', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it.each([
        ['instagram', false],
        ['facebook', false],
    ])(
        'should display the correct text for %s comment',
        (_, isFacebookComment) => {
            const {container} = renderAction({
                isFacebookComment,
            })
            expect(container.firstChild).toMatchSnapshot()
        }
    )
})
