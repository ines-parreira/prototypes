import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import HttpAction from '../HttpAction'
import {
    MACRO_ACTION_NAME,
    MACRO_ACTION_TYPE,
} from '../../../../../../../models/macroAction/constants.ts'

describe('HTTP action component', () => {
    const defaultAction = {
        title: 'HTTP hook',
        type: MACRO_ACTION_TYPE.USER,
        name: MACRO_ACTION_NAME.HTTP,
        arguments: {
            form: [],
        },
    }

    it('should render the HTTP action component', () => {
        const {container} = render(
            <HttpAction
                action={fromJS(defaultAction)}
                index={1}
                updateActionArgs={() => Promise.resolve()}
                updateActionTitle={() => Promise.resolve()}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
