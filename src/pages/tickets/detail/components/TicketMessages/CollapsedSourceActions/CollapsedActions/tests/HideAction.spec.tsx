import React from 'react'

import _noop from 'lodash/noop'

import {Dropdown} from 'reactstrap'

import {render} from '@testing-library/react'

import HideAction from '../HideAction'

const renderAction = ({shouldHide = false, isFacebookComment = true} = {}) =>
    render(
        <Dropdown toggle={_noop}>
            <HideAction
                shouldHide={shouldHide}
                isFacebookComment={isFacebookComment}
                toggleHideComment={_noop}
            />
        </Dropdown>
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
        const {container} = renderAction(props)
        expect(container.firstChild).toMatchSnapshot()
    })
})
