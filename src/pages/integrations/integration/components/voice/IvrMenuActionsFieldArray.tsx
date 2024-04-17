import React from 'react'
import {produce} from 'immer'
import classnames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'

import Button from 'pages/common/components/button/Button'
import {
    IvrMenuAction,
    IvrMenuActionType,
    IvrForwardCallMenuAction,
} from 'models/integration/types'
import {FeatureFlagKey} from 'config/featureFlags'

import IvrMenuActionField from './IvrMenuActionField'
import css from './VoiceIntegrationIvr.less'

type Props = {
    value: IvrMenuAction[]
    onChange: (value: IvrMenuAction[]) => void
}

const IvrMenuActionsFieldArray = (props: Props): JSX.Element => {
    const {value, onChange} = props
    const deflectToSMSEnabled = useFlags()[FeatureFlagKey.DeflectToSMS]

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
            {deflectToSMSEnabled ? (
                <>
                    <h4 className={classnames(css.header, css.inner)}>
                        Menu options
                    </h4>
                    <p>
                        Options are triggered by Dialpad and route calls to team
                        members, SMS or external phone number
                    </p>
                </>
            ) : (
                <h4 className="mb-3">Menu options</h4>
            )}
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
                <Button intent="secondary" onClick={addAction}>
                    <i className="material-icons mr-2">add</i>Add option
                </Button>
            )}
        </div>
    )
}

export default IvrMenuActionsFieldArray
