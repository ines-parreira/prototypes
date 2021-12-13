import React, {useCallback, useState} from 'react'
import {Button, Row, Col, Input} from 'reactstrap'
import {map} from 'lodash'
import classNames from 'classnames'

import {
    VoiceMessage,
    IvrMenuAction,
    IvrMenuActionType,
    IvrForwardCallMenuAction,
} from 'models/integration/types'
import {DEFAULT_VOICE_MESSAGE} from 'models/integration/constants'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {Drawer} from 'pages/common/components/Drawer'

import VoiceMessageField from './VoiceMessageField'
import IvrPhoneNumberSelectField from './IvrPhoneNumberSelectField'
import css from './IvrMenuActionField.less'

type Props = {
    value: IvrMenuAction
    onChange: (value: IvrMenuAction) => void
    onRemove: () => void
}

const ACTION_NAMES: Record<IvrMenuActionType, string> = {
    [IvrMenuActionType.ForwardToExternalNumber]:
        'Forward call to external number',
    [IvrMenuActionType.ForwardToGorgiasNumber]:
        'Forward call to Gorgias number',
    [IvrMenuActionType.PlayMessage]: 'Play message',
}

const IvrMenuActionField = ({
    value,
    onChange,
    onRemove,
}: Props): JSX.Element => {
    const [isDrawerOpen, setDrawerOpen] = useState<boolean>(false)
    const [editingVoiceMessage, setEditingVoiceMessage] =
        useState<VoiceMessage>(DEFAULT_VOICE_MESSAGE)

    const handleActionTypeChange = useCallback(
        (action) => {
            switch (action) {
                case IvrMenuActionType.PlayMessage: {
                    onChange({
                        ...value,
                        action,
                    })
                    break
                }

                case IvrMenuActionType.ForwardToExternalNumber:
                case IvrMenuActionType.ForwardToGorgiasNumber: {
                    onChange({
                        ...value,
                        action,
                        forward_call: (value as IvrForwardCallMenuAction)
                            .forward_call ?? {
                            phone_number: '',
                        },
                    })
                    break
                }
            }
        },
        [value, onChange]
    )

    return (
        <Row className={css.row}>
            <Col className={classNames(css.smallColumn, 'pr-0')}>
                <span className={css.digit}>{value.digit}</span>
            </Col>
            <Col className={classNames('pr-0', 'pl-2')}>
                <SelectField
                    placeholder="Select an action"
                    value={value.action}
                    onChange={(action) => {
                        handleActionTypeChange(action)
                    }}
                    options={map(IvrMenuActionType, (action) => ({
                        value: action,
                        label: ACTION_NAMES[action],
                    }))}
                    fullWidth
                />
            </Col>
            <Col className="pl-2">
                {value.action === IvrMenuActionType.PlayMessage && (
                    <>
                        {value.voice_message ? (
                            <Button
                                onClick={() => {
                                    setEditingVoiceMessage(value.voice_message)
                                    setDrawerOpen(true)
                                }}
                                color="link"
                            >
                                <i className="material-icons mr-2">edit</i>
                                Edit message
                            </Button>
                        ) : (
                            <Button
                                onClick={() => setDrawerOpen(true)}
                                color="link"
                            >
                                <i className="material-icons mr-2">add</i>
                                Add message
                            </Button>
                        )}
                        <Drawer
                            name="voice-message"
                            open={isDrawerOpen}
                            fullscreen={false}
                            isLoading={false}
                            portalRootId="app-root"
                            onBackdropClick={() => setDrawerOpen(false)}
                        >
                            <Drawer.Header>
                                <h3>Add message</h3>
                                <Drawer.HeaderActions>
                                    <Button
                                        color="link"
                                        onClick={() => setDrawerOpen(false)}
                                        className={css.closeDrawerButton}
                                    >
                                        <i className="material-icons">
                                            keyboard_tab
                                        </i>
                                    </Button>
                                </Drawer.HeaderActions>
                            </Drawer.Header>
                            <Drawer.Content className={css.drawerContent}>
                                <VoiceMessageField
                                    value={editingVoiceMessage}
                                    onChange={setEditingVoiceMessage}
                                />
                            </Drawer.Content>
                            <Drawer.Footer>
                                <Button
                                    onClick={() => {
                                        onChange({
                                            ...value,
                                            voice_message: editingVoiceMessage,
                                        })
                                        setEditingVoiceMessage(
                                            DEFAULT_VOICE_MESSAGE
                                        )
                                        setDrawerOpen(false)
                                    }}
                                    color="primary"
                                >
                                    Save
                                </Button>
                                <Button
                                    onClick={() => setDrawerOpen(false)}
                                    className="ml-2"
                                >
                                    Cancel
                                </Button>
                            </Drawer.Footer>
                        </Drawer>
                    </>
                )}
                {value.action === IvrMenuActionType.ForwardToExternalNumber && (
                    <Input
                        value={value.forward_call.phone_number}
                        onChange={(event) => {
                            onChange({
                                ...value,
                                forward_call: {
                                    phone_number: event.target.value,
                                },
                            })
                        }}
                    />
                )}
                {value.action === IvrMenuActionType.ForwardToGorgiasNumber && (
                    <IvrPhoneNumberSelectField
                        value={value.forward_call}
                        onChange={(forwardCallSettings) => {
                            onChange({
                                ...value,
                                forward_call: forwardCallSettings,
                            })
                        }}
                    />
                )}
            </Col>
            <Col className={classNames(css.smallColumn, 'pl-0')}>
                <Button
                    onClick={onRemove}
                    className={css.deleteButton}
                    color="link"
                >
                    <i className="material-icons mr-2">close</i>
                </Button>
            </Col>
        </Row>
    )
}

export default IvrMenuActionField
