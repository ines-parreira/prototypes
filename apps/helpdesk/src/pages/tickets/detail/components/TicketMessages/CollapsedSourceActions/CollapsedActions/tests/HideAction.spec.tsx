import React from 'react'

import { render } from '@repo/testing'
import { Dropdown } from 'reactstrap'
import { noop } from '@gorgias/toolkit'

import { HideAction } from '../HideAction'

const renderAction = ({ shouldHide = false, isFacebookComment = true } = {}) =>
    render(
        <Dropdown toggle={noop}>
            <HideAction
                shouldHide={shouldHide}
                isFacebookComment={isFacebookComment}
                toggleHideComment={noop}
            />
        </Dropdown>,
    )

describe('<HideAction/>', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it.each([
        [
            'hiding instagram',
            {
                shouldHide: true,
                isFacebookComment: false,
            },
        ],
        [
            'unhiding non-instagram',
            {
                shouldHide: false,
                isFacebookComment: true,
            },
        ],
    ])('should display the correct text for %s comment', (_, props) => {
        const { container } = renderAction(props)
        expect(container.firstChild).toMatchSnapshot()
    })
})
