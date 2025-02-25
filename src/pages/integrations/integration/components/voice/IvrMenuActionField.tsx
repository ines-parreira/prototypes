import React, { useState } from 'react'

import classNames from 'classnames'
import { Col, Row } from 'reactstrap'

import useAppSelector from 'hooks/useAppSelector'
import { DEFAULT_VOICE_MESSAGE } from 'models/integration/constants'
import {
    IvrMenuAction,
    IvrMenuActionType,
    VoiceMessage,
} from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import { Drawer } from 'pages/common/components/Drawer'
import PhoneNumberInput from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import { getSmsIntegrations } from 'state/integrations/selectors'

import IvrMenuActionSelect from './IvrMenuActionSelect'
import IvrMenuActionSendToSMSField from './IvrMenuActionSendToSMSField'
import IvrPhoneNumberSelectField from './IvrPhoneNumberSelectField'
import VoiceMessageField from './VoiceMessageField'

import css from './IvrMenuActionField.less'

type Props = {
    value: IvrMenuAction
    onChange: (value: IvrMenuAction) => void
    onRemove: () => void
}

const IvrMenuActionField = ({
    value,
    onChange,
    onRemove,
}: Props): JSX.Element => {
    const [isDrawerOpen, setDrawerOpen] = useState<boolean>(false)
    const [editingVoiceMessage, setEditingVoiceMessage] =
        useState<VoiceMessage>(DEFAULT_VOICE_MESSAGE)
    const smsIntegrations = useAppSelector(getSmsIntegrations)
    const hasSmsIntegrations = !!smsIntegrations.length

    return (
        <Row className={css.row}>
            <Col className={classNames(css.smallColumn, 'pr-0')}>
                <span className={css.digit}>{value.digit}</span>
            </Col>
            <Col className={classNames('pr-0', 'pl-2')}>
                <IvrMenuActionSelect
                    onChange={onChange}
                    value={value}
                    hasSmsIntegrations={hasSmsIntegrations}
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
                                intent="primary"
                                fillStyle="ghost"
                                className={css.linkBtn}
                            >
                                <i className="material-icons mr-2">edit</i>
                                Edit message
                            </Button>
                        ) : (
                            <Button
                                onClick={() => setDrawerOpen(true)}
                                intent="primary"
                                fillStyle="ghost"
                                className={css.linkBtn}
                            >
                                <i className="material-icons mr-2">add</i>
                                Add message
                            </Button>
                        )}
                        <Drawer
                            aria-label="Voice message"
                            open={isDrawerOpen}
                            fullscreen={false}
                            isLoading={false}
                            portalRootId="app-root"
                            onBackdropClick={() => setDrawerOpen(false)}
                        >
                            <Drawer.Header className={css.drawerHeader}>
                                <h3 className={css.title}>Message</h3>
                                <Drawer.HeaderActions>
                                    <IconButton
                                        fillStyle="ghost"
                                        intent="secondary"
                                        onClick={() => setDrawerOpen(false)}
                                    >
                                        keyboard_tab
                                    </IconButton>
                                </Drawer.HeaderActions>
                            </Drawer.Header>
                            <Drawer.Content className={css.drawerContent}>
                                <VoiceMessageField
                                    value={editingVoiceMessage}
                                    onChange={setEditingVoiceMessage}
                                    radioButtonId={'play-message'}
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
                                            DEFAULT_VOICE_MESSAGE,
                                        )
                                        setDrawerOpen(false)
                                    }}
                                    intent="primary"
                                >
                                    Save Changes
                                </Button>
                                <Button
                                    onClick={() => setDrawerOpen(false)}
                                    className="ml-2"
                                    intent="secondary"
                                >
                                    Cancel
                                </Button>
                            </Drawer.Footer>
                        </Drawer>
                    </>
                )}
                {value.action === IvrMenuActionType.ForwardToExternalNumber && (
                    <PhoneNumberInput
                        value={value.forward_call.phone_number}
                        onChange={(phone) => {
                            onChange({
                                ...value,
                                forward_call: {
                                    phone_number: phone,
                                },
                            })
                        }}
                        data-1p-ignore
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
                {value.action === IvrMenuActionType.SendToSms && (
                    <IvrMenuActionSendToSMSField
                        settings={value.sms_deflection}
                        onChange={(smsDeflection) => {
                            onChange({
                                ...value,
                                sms_deflection: smsDeflection,
                            })
                        }}
                        isDrawerOpen={isDrawerOpen}
                        setDrawerOpen={setDrawerOpen}
                        smsIntegrations={smsIntegrations}
                    />
                )}
            </Col>
            <Col className={classNames(css.smallColumn, 'pl-0')}>
                <IconButton
                    fillStyle="ghost"
                    intent="destructive"
                    onClick={onRemove}
                >
                    close
                </IconButton>
            </Col>
        </Row>
    )
}

export default IvrMenuActionField
