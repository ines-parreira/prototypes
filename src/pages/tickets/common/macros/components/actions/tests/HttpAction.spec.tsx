import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import {
    MACRO_ACTION_NAME,
    MACRO_ACTION_TYPE,
} from 'models/macroAction/constants'
import {Action, ActionStatus} from 'models/ticket/types'

import HttpAction from '../HttpAction'

describe('HTTP action component', () => {
    const action: Action = {
        status: ActionStatus.Success,
        title: 'HTTP hook',
        type: MACRO_ACTION_TYPE.USER,
        name: MACRO_ACTION_NAME.HTTP,
    }

    it('should render the HTTP action component', () => {
        const {container} = render(
            <HttpAction
                action={fromJS(action)}
                index={1}
                updateActionArgs={jest.fn()}
                updateActionTitle={jest.fn()}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
