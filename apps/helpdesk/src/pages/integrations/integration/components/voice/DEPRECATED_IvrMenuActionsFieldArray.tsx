import classnames from 'classnames'
import { produce } from 'immer'

import { LegacyButton as Button } from '@gorgias/axiom'

import {
    IvrForwardCallMenuAction,
    IvrMenuAction,
    IvrMenuActionType,
} from 'models/integration/types'

import IvrMenuActionField from './IvrMenuActionField'

import css from './VoiceIntegrationIvr.less'

type Props = {
    value: IvrMenuAction[]
    onChange: (value: IvrMenuAction[]) => void
}

const DEPRECATED_IvrMenuActionsFieldArray = (props: Props): JSX.Element => {
    const { value, onChange } = props

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
                    (action, index) => (action.digit = (index + 1).toString()),
                )
            }),
        )
    }

    const updateAction = (index: number, action: IvrMenuAction) => {
        onChange(
            produce(value, (draft) => {
                draft[index] = action
            }),
        )
    }

    return (
        <div>
            <h4 className={classnames(css.header, css.inner)}>Menu options</h4>
            <p>
                Options are triggered by Dialpad and route calls to team
                members, SMS or external phone number
            </p>

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
                <Button
                    intent="secondary"
                    onClick={addAction}
                    leadingIcon="add"
                >
                    Add option
                </Button>
            )}
        </div>
    )
}

export default DEPRECATED_IvrMenuActionsFieldArray
