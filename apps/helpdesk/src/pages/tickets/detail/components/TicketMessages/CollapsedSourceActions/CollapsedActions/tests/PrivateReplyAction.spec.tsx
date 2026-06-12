import React from 'react'

import { render } from '@repo/testing'
import { Dropdown } from 'reactstrap'
import { noop } from '@gorgias/toolkit'

import { message } from 'models/ticket/tests/mocks'

import { PrivateReplyAction } from '../PrivateReplyAction'

const renderAction = ({ isFacebookComment = false } = {}) =>
    render(
        <Dropdown toggle={noop}>
            <PrivateReplyAction
                message={message}
                isFacebookComment={isFacebookComment}
                onClick={noop}
            />
        </Dropdown>,
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
            const { container } = renderAction({
                isFacebookComment,
            })
            expect(container.firstChild).toMatchSnapshot()
        },
    )
})
