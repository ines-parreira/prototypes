import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import {times} from 'lodash'

import {
    IvrMenuAction,
    IvrMenuActionType,
} from '../../../../../../models/integration/types'
import IvrMenuActionsFieldArray from '../IvrMenuActionsFieldArray'

describe('<IvrMenuActionsFieldArray />', () => {
    const onChange: jest.MockedFunction<(
        value: IvrMenuAction[]
    ) => void> = jest.fn()

    const options: IvrMenuAction[] = [
        {
            action: IvrMenuActionType.ForwardToExternalNumber,
            digit: '1',
            forward_call: {
                phone_number: '+123456789',
            },
        },
    ]

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render', () => {
        const {container} = render(
            <IvrMenuActionsFieldArray value={options} onChange={onChange} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should allow adding menu options', () => {
        const {getByText} = render(
            <IvrMenuActionsFieldArray value={options} onChange={onChange} />
        )

        const addButton = getByText('Add option')
        fireEvent.click(addButton)

        expect(onChange).toHaveBeenCalledWith([
            ...options,
            {
                action: IvrMenuActionType.ForwardToExternalNumber,
                digit: '2',
                forward_call: {
                    phone_number: '',
                },
            },
        ])
    })

    it('should allow removing menu options', () => {
        const {getByText} = render(
            <IvrMenuActionsFieldArray value={options} onChange={onChange} />
        )

        const removeButton = getByText('close')
        fireEvent.click(removeButton)

        expect(onChange).toHaveBeenCalledWith([])
    })

    it('should limit the number of actions to 9', () => {
        const options: IvrMenuAction[] = times(9, (index) => ({
            digit: (index + 1).toString(),
            action: IvrMenuActionType.ForwardToExternalNumber,
            forward_call: {
                phone_number: '',
            },
        }))

        const {queryByText} = render(
            <IvrMenuActionsFieldArray value={options} onChange={onChange} />
        )

        const addButton = queryByText('Add option')
        expect(addButton).toBeNull()
    })
})
