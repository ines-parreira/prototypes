import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import { MacroActionName, MacroActionType } from 'models/macroAction/types'
import type { Action } from 'models/ticket/types'
import { ActionStatus } from 'models/ticket/types'

import HttpAction from '../HttpAction'

describe('HTTP action component', () => {
    const action: Action = {
        status: ActionStatus.Success,
        title: 'HTTP hook',
        type: MacroActionType.User,
        name: MacroActionName.Http,
    }

    it('should render the HTTP action component', () => {
        const { container } = render(
            <HttpAction
                action={fromJS(action)}
                index={1}
                updateActionArgs={jest.fn()}
                updateActionTitle={jest.fn()}
            />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
