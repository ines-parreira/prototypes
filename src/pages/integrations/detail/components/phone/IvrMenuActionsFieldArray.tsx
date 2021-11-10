import React from 'react'
import {Button} from 'reactstrap'
import produce from 'immer'

import {
    IvrMenuAction,
    IvrMenuActionType,
    IvrForwardCallMenuAction,
} from '../../../../../models/integration/types'

import IvrMenuActionField from './IvrMenuActionField'

type Props = {
    value: IvrMenuAction[]
    onChange: (value: IvrMenuAction[]) => void
}

const IvrMenuActionsFieldArray = (props: Props): JSX.Element => {
    const {value, onChange} = props

    const addAction = () => {
        const digit = (value.length + 1).toString()
        const newAction: IvrForwardCallMenuAction = {
            digit,
            action: IvrMenuActionType.ForwardToExternalNumber,
            forward_call: {
                phone_number: '',
            },
        }

        onChange([...value, newAction])
    }

    const removeAction = (index: number) => {
        onChange(
            produce(value, (draft) => {
                draft.splice(index, 1)
                draft.map(
                    (action, index) => (action.digit = (index + 1).toString())
                )
            })
        )
    }

    const updateAction = (index: number, action: IvrMenuAction) => {
        onChange(
            produce(value, (draft) => {
                draft[index] = action
            })
        )
    }

    return (
        <div>
            <h5>Menu options</h5>
            {value.map((action: IvrMenuAction, index: number) => {
                return (
                    <div key={index}>
                        <IvrMenuActionField
                            value={action}
                            onChange={(action) => updateAction(index, action)}
                            onRemove={() => removeAction(index)}
                        />
                    </div>
                )
            })}
            {value.length < 9 && (
                <Button onClick={addAction}>
                    <i className="material-icons mr-2">add</i>Add option
                </Button>
            )}
        </div>
    )
}

export default IvrMenuActionsFieldArray
