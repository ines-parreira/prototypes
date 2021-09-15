import React, {RefObject, useCallback, useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map} from 'immutable'
import {
    Alert,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Col,
    Container,
    Form,
    FormGroup,
    Input,
    Label,
    Row,
} from 'reactstrap'

import classnames from 'classnames'

import PageHeader from '../../../../common/components/PageHeader'
import {IntegrationType} from '../../../../../models/integration/types'
import BooleanField from '../../../../common/forms/BooleanField.js'

import {notify} from '../../../../../state/notifications/actions'

import {NotificationStatus} from '../../../../../state/notifications/types'
import {countLines} from '../../../../../utils/string'

import {updatePhoneVoicemailConfiguration} from './actions'

import PhoneIntegrationNavigation from './PhoneIntegrationNavigation'
import css from './PhoneIntegrationVoicemail.less'

type Props = {
    integration: Map<string, any>
}

const TEXT_TO_SPEECH_MAX_LENGTH = 1000
const MAX_VOICE_RECORDING_FILE_SIZE_MB = 2
const MAX_VOICE_RECORDING_FILE_SIZE = MAX_VOICE_RECORDING_FILE_SIZE_MB * 1000000

export enum VoiceMailType {
    VoiceRecording = 'voice_recording',
    TextToSpeech = 'text_to_speech',
}

export function PhoneIntegrationVoicemail({
    integration,
    updatePhoneVoicemailConfiguration,
    notify,
}: Props & ConnectedProps<typeof connector>): JSX.Element {
    const voiceRecordingFileInput = React.useRef() as RefObject<
        HTMLInputElement
    >
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [voicemailType, setVoicemailType] = useState<VoiceMailType | null>(
        null
    )
    const [voiceRecordingFilePath, setVoiceRecordingFilePath] = useState<
        string | null
    >(null)
    const [
        newVoiceRecordingFile,
        setNewVoiceRecordingFile,
    ] = useState<File | null>(null)
    const [textToSpeechContent, setTextToSpeechContent] = useState<
        string | null
    >(null)
    const [allowToLeaveVoicemail, setAllowToLeaveVoicemail] = useState<boolean>(
        false
    )

    useEffect(() => {
        const voiceMailConfiguration = integration.getIn(
            ['meta', 'voicemail'],
            fromJS({})
        ) as Map<string, string | boolean | null>

        setVoiceRecordingFilePath(
            voiceMailConfiguration.get('voice_recording_file_path') as
                | string
                | null
        )
        setTextToSpeechContent(
            voiceMailConfiguration.get('text_to_speech_content') as
                | string
                | null
        )
        setVoicemailType(
            voiceMailConfiguration.get('voicemail_type') as VoiceMailType | null
        )
        setAllowToLeaveVoicemail(
            voiceMailConfiguration.get(
                'allow_to_leave_voicemail',
                false
            ) as boolean
        )
    }, [
        integration,
        setTextToSpeechContent,
        setVoicemailType,
        setVoiceRecordingFilePath,
        setNewVoiceRecordingFile,
    ])

    const handleChangeVoiceMailType = useCallback(
        (voicemailType: VoiceMailType) => {
            const integrationVoiceRecordingFilePath = integration.getIn([
                'meta',
                'voicemail',
                'voice_recording_file_path',
            ])

            if (voiceRecordingFilePath !== integrationVoiceRecordingFilePath) {
                setVoiceRecordingFilePath(integrationVoiceRecordingFilePath)
            }
            setNewVoiceRecordingFile(null)
            setVoicemailType(voicemailType)
        },
        [
            integration,
            setNewVoiceRecordingFile,
            setVoicemailType,
            voiceRecordingFilePath,
            setVoiceRecordingFilePath,
        ]
    )
    const handleUploadButtonClick = () => {
        voiceRecordingFileInput.current?.click()
    }
    const onSubmit = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault()
            const formData = new FormData()

            formData.append('voicemail_type', voicemailType as string)
            formData.append(
                'allow_to_leave_voicemail',
                allowToLeaveVoicemail.toString()
            )
            if (voicemailType === VoiceMailType.TextToSpeech) {
                formData.append(
                    'text_to_speech_content',
                    textToSpeechContent as string
                )
            } else if (newVoiceRecordingFile) {
                formData.append(
                    'new_voice_recording_file',
                    newVoiceRecordingFile
                )
            }

            setIsLoading(true)
            try {
                setError(null)
                await updatePhoneVoicemailConfiguration(formData)
            } catch (error) {
                setError(error)
            } finally {
                setIsLoading(false)
            }
        },
        [
            voicemailType,
            textToSpeechContent,
            allowToLeaveVoicemail,
            newVoiceRecordingFile,
            setIsLoading,
            setError,
            updatePhoneVoicemailConfiguration,
        ]
    )

    const uploadVoiceRecordingFile = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            if (!event.target.files) {
                return
            }

            const uploadedVoiceRecordingFile = event.target.files[0]
            if (
                uploadedVoiceRecordingFile.size > MAX_VOICE_RECORDING_FILE_SIZE
            ) {
                return notify({
                    message: `Invalid file size. The max size is ${MAX_VOICE_RECORDING_FILE_SIZE_MB} MB.`,
                    status: NotificationStatus.Error,
                })
            }

            setNewVoiceRecordingFile(uploadedVoiceRecordingFile)
            setVoiceRecordingFilePath(
                window.URL.createObjectURL(uploadedVoiceRecordingFile)
            )
        },
        [setNewVoiceRecordingFile, setVoiceRecordingFilePath, notify]
    )

    const isVoiceRecordingTypeSelected =
        voicemailType === VoiceMailType.VoiceRecording
    const isTextToSpeechTypeSelected =
        voicemailType === VoiceMailType.TextToSpeech

    const displayCallerOptions =
        (isTextToSpeechTypeSelected && textToSpeechContent) ||
        (isVoiceRecordingTypeSelected && voiceRecordingFilePath)

    const textToSpeechLines = textToSpeechContent
        ? countLines(textToSpeechContent)
        : 0

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">
                                Integrations
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/settings/integrations/${IntegrationType.PhoneIntegrationType}`}
                            >
                                Phone
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {integration.getIn(['meta', 'emoji'])}{' '}
                            {integration.get('name')}
                            <small className="text-muted ml-2">
                                {integration.getIn([
                                    'meta',
                                    'twilio',
                                    'incoming_phone_number',
                                    'friendly_name',
                                ])}
                            </small>
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />

            <PhoneIntegrationNavigation integration={integration} />
            <Container fluid className="page-container">
                <Row className={css.heading}>
                    <Col>Set Voicemail</Col>
                </Row>
                <Row className={css.description}>
                    <Col>
                        Create a voicemail by uploading an .MP3 file or typing
                        out the message with Text to speech.
                    </Col>
                </Row>
                <Row>
                    <Col lg={6} xl={7}>
                        <Form onSubmit={onSubmit}>
                            {!!error && (
                                <Alert color="danger">{error.toString()}</Alert>
                            )}
                            <FormGroup>
                                <Col>
                                    <Input
                                        name="voicemail_type"
                                        type="radio"
                                        id="voiceRecordingType"
                                        checked={isVoiceRecordingTypeSelected}
                                        onChange={() => {
                                            handleChangeVoiceMailType(
                                                VoiceMailType.VoiceRecording
                                            )
                                        }}
                                    />
                                    <Label for="voiceRecordingType">
                                        Insert Voice Recording
                                    </Label>
                                </Col>
                                {isVoiceRecordingTypeSelected && (
                                    <Col>
                                        {voiceRecordingFilePath && (
                                            // eslint-disable-next-line jsx-a11y/media-has-caption
                                            <audio
                                                controls
                                                src={voiceRecordingFilePath}
                                            />
                                        )}
                                        <div className="mt-2">
                                            <input
                                                className="d-none"
                                                type="file"
                                                name="new_voice_recording_file"
                                                accept=".mp3"
                                                ref={voiceRecordingFileInput}
                                                onChange={
                                                    uploadVoiceRecordingFile
                                                }
                                            />
                                            <Button
                                                type="button"
                                                onClick={
                                                    handleUploadButtonClick
                                                }
                                            >
                                                <i className="material-icons large">
                                                    backup
                                                </i>{' '}
                                                Select file
                                            </Button>
                                        </div>
                                    </Col>
                                )}
                            </FormGroup>
                            <FormGroup>
                                <Col>
                                    <Input
                                        name="voicemail_type"
                                        type="radio"
                                        id="textToSpeechType"
                                        onChange={() => {
                                            handleChangeVoiceMailType(
                                                VoiceMailType.TextToSpeech
                                            )
                                        }}
                                        checked={isTextToSpeechTypeSelected}
                                    />
                                    <Label for="textToSpeechType">
                                        Text To Speech
                                    </Label>
                                </Col>
                                {isTextToSpeechTypeSelected && (
                                    <Col>
                                        <Input
                                            type="textarea"
                                            name="text_to_speech_content"
                                            id="textToSpeechContent"
                                            maxLength={
                                                TEXT_TO_SPEECH_MAX_LENGTH
                                            }
                                            value={
                                                textToSpeechContent
                                                    ? textToSpeechContent
                                                    : ''
                                            }
                                            onChange={(event) => {
                                                setTextToSpeechContent(
                                                    event.target.value
                                                )
                                            }}
                                            rows={
                                                textToSpeechLines > 2
                                                    ? textToSpeechLines
                                                    : 2
                                            }
                                        />
                                    </Col>
                                )}
                            </FormGroup>
                            {displayCallerOptions && (
                                <>
                                    <div className={css.heading}>
                                        Caller Options
                                    </div>
                                    <BooleanField
                                        type="checkbox"
                                        value={allowToLeaveVoicemail}
                                        onChange={setAllowToLeaveVoicemail}
                                        label="Allow caller to leave voicemail"
                                    />
                                </>
                            )}

                            <Button
                                type="submit"
                                color="success"
                                className={classnames('mt-5', {
                                    'btn-loading': isLoading,
                                })}
                                disabled={isLoading || !displayCallerOptions}
                            >
                                Save changes
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

const mapDispatchToProps = {updatePhoneVoicemailConfiguration, notify}
const connector = connect(null, mapDispatchToProps)

export default connector(PhoneIntegrationVoicemail)
