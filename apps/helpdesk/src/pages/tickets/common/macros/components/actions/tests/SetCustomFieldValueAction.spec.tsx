import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import CustomFieldIdInput from 'pages/common/components/ast/widget/CustomFieldIdInput'
import CustomFieldSelect from 'pages/common/components/ast/widget/CustomFieldSelect'

import SetCustomFieldAction from '../SetCustomFieldValueAction'

jest.mock('pages/common/components/ast/widget/CustomFieldSelect', () =>
    jest.fn(() => <div>CustomFieldSelect</div>),
)
jest.mock('pages/common/components/ast/widget/CustomFieldIdInput', () =>
    jest.fn(() => <div>CustomFieldIdInput</div>),
)

const mockCustomFieldSelect = assumeMock(CustomFieldSelect)
const mockCustomFieldIdInput = assumeMock(CustomFieldIdInput)

describe('<SetCustomFieldAction/>', () => {
    const updateActionsArgs = jest.fn()
    const index = 0
    it('should provide the correct props to sub components', () => {
        const action1 = {
            arguments: {
                custom_field_id: 1,
                value: 'Test value',
            },
        }
        const action2 = {
            arguments: {
                custom_field_id: 2,
                value: 'Test value',
            },
        }
        render(
            <SetCustomFieldAction
                index={index}
                action={fromJS(action1)}
                actions={fromJS([action1, action2])}
                updateActionArgs={updateActionsArgs}
            />,
        )
        expect(mockCustomFieldSelect).toHaveBeenCalledTimes(1)
        expect(mockCustomFieldSelect.mock.calls[0][0].idsAlreadySet).toEqual([
            action1.arguments.custom_field_id,
            action2.arguments.custom_field_id,
        ])
        mockCustomFieldSelect.mock.calls[0][0]?.onChange?.(2)
        expect(updateActionsArgs).toHaveBeenNthCalledWith(
            1,
            index,
            fromJS({ ...action1.arguments, custom_field_id: 2 }),
        )
        expect(mockCustomFieldIdInput).toHaveBeenCalledTimes(1)
        mockCustomFieldIdInput.mock.calls[0][0]?.onChange?.('new')
        expect(updateActionsArgs).toHaveBeenNthCalledWith(
            2,
            index,
            fromJS({ ...action1.arguments, value: 'new' }),
        )
    })
})
