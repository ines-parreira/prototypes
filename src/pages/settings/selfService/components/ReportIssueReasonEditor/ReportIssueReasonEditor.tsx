import {EditorState} from 'draft-js'
import React, {ComponentType, useEffect, useMemo, useRef, useState} from 'react'
import {Link, useHistory, useRouteMatch} from 'react-router-dom'
import {
    Breadcrumb,
    BreadcrumbItem,
    Col,
    Container,
    Form,
    FormGroup,
    FormText,
    Label,
    Row,
} from 'reactstrap'
import {UnregisterCallback} from 'history'
import produce from 'immer'

import PageHeader from 'pages/common/components/PageHeader'

import DEPRECATED_RichField from 'pages/common/forms/RichField/DEPRECATED_RichField'
import {useConfigurationData} from 'pages/settings/selfService/components/hooks'
import settingsCss from 'pages/settings/settings.less'

import {deleteAttachment as deleteAttachmentAction} from 'state/newMessage/actions'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import InputField from 'pages/common/forms/input/InputField'
import TicketAttachments from 'pages/tickets/detail/components/ReplyArea/TicketAttachments'
import {getNewMessageAttachments} from 'state/newMessage/selectors'
import {convertToHTML} from 'utils/editor'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {
    AUTOMATED_RESPONSE,
    ReportIssueCaseReasonAction,
} from 'models/selfServiceConfiguration/types'
import {updateSelfServiceConfiguration} from 'models/selfServiceConfiguration/resources'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import ToggleInput from 'pages/common/forms/ToggleInput'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import {selfServiceConfigurationUpdated} from 'state/entities/selfServiceConfigurations/actions'
import {SelectableOption} from 'pages/common/forms/SelectField/types'

import {MAX_AUTOMATED_RESPONSE_LENGTH} from '../../constants'
import SelfServicePreferencesNavbar from '../SelfServicePreferencesNavbar'
import {SELECTABLE_REASONS_DROPDOWN_OPTIONS} from '../ReportIssueCaseEditor/constants'
import ReportIssuePreview, {
    ReportIssuePreviewMode,
} from '../ReportIssuePreview/ReportIssuePreview'

import css from './ReportIssueReasonEditor.less'

const ReportIssueReasonEditor: ComponentType = () => {
    const dispatch = useAppDispatch()
    const history = useHistory()

    const {
        params: {
            shopName,
            integrationType,
            caseIndex,
            reasonIndex: rawReasonIndex,
        },
    } = useRouteMatch<{
        shopName: string
        integrationType: string
        caseIndex: string
        reasonIndex: string
    }>()

    const linkToScenario = `/app/settings/self-service/${integrationType}/${shopName}/preferences/report-issue/${caseIndex}`

    const reasonIndex = useMemo(() => Number(rawReasonIndex), [rawReasonIndex])

    const [isDirty, setIsDirty] = useState(false)

    const [caseOptions, setCaseOptions] = useState<SelectableOption[]>([])
    const [caseTitle, setCaseTitle] = useState('')
    const [reasonAction, setReasonAction] = useState<
        ReportIssueCaseReasonAction | undefined
    >(undefined)
    const [reasonKey, setReasonKey] = useState<string | undefined>(undefined)

    const [modalNextUrl, setModalNextUrl] = useState<string | undefined>(
        undefined
    )

    const unblockRef = useRef<UnregisterCallback>()

    useEffect(() => {
        unblockRef.current = history.block((location) => {
            if (isDirty) {
                setModalNextUrl(location.pathname)
                return false
            }
        })
        return () => {
            unblockRef.current && unblockRef.current()
        }
    }, [history, isDirty])

    const {isLoadingConfig, configuration} = useConfigurationData()

    const newMessageAttachments = useAppSelector(getNewMessageAttachments)
    const deleteAttachment = (index: number) => {
        dispatch(deleteAttachmentAction(index))
    }

    const [isResponseTooLong, setIsResponseTooLong] = useState(false)
    const [previewMode, setPreviewMode] =
        useState<ReportIssuePreviewMode>('messagethread')

    useEffect(() => {
        if (configuration && !isLoadingConfig) {
            const {reasons, title} =
                configuration.report_issue_policy.cases[Number(caseIndex)]

            const reason = reasons[reasonIndex]

            setIsDirty(false)
            setCaseTitle(title)
            setReasonKey(reason.reasonKey)
            setReasonAction(
                reason.action ?? {
                    type: AUTOMATED_RESPONSE,
                    responseMessageContent: {
                        text: '',
                        html: '',
                    },
                    showHelpfulPrompt: false,
                }
            )

            setCaseOptions(
                reasons
                    .map(({action, reasonKey: optionReasonKey}) => {
                        const option = SELECTABLE_REASONS_DROPDOWN_OPTIONS.find(
                            ({value}) => value === optionReasonKey
                        )

                        if (!option) {
                            return undefined
                        }

                        const noAutomatedResponse =
                            !action?.responseMessageContent.text
                        const isNotCurrentReason =
                            optionReasonKey !== reason.reasonKey

                        return {
                            ...option,
                            label: (
                                <div className={css.option}>
                                    {option.label}

                                    {noAutomatedResponse && isNotCurrentReason && (
                                        <div className={css.noResponseWarning}>
                                            <i className="material-icons">
                                                error
                                            </i>{' '}
                                            No response configured
                                        </div>
                                    )}
                                </div>
                            ),
                        }
                    })
                    .filter(
                        (
                            o: SelectableOption | undefined
                        ): o is SelectableOption => o !== undefined
                    ) as SelectableOption[]
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoadingConfig, configuration, reasonIndex])

    const saveChanges = async () => {
        if (!configuration) {
            return
        }

        const newConfiguration = produce(
            configuration,
            (draftConfiguration) => {
                const reasons =
                    draftConfiguration.report_issue_policy.cases[
                        Number(caseIndex)
                    ].reasons

                reasons[reasonIndex] = {
                    ...reasons[reasonIndex],
                    action: reasonAction,
                }
            }
        )

        try {
            const res = await updateSelfServiceConfiguration(newConfiguration)
            setIsDirty(false)
            void dispatch(selfServiceConfigurationUpdated(res))
            void (await dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Option successfully updated.',
                })
            ))
        } catch (error) {
            void (await dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Could not update option, please try again later.',
                })
            ))
        }
    }

    const handleResponseChange = (value: EditorState) => {
        const content = value.getCurrentContent()

        const text = content.getPlainText()

        if (
            !reasonAction ||
            text === reasonAction.responseMessageContent.text
        ) {
            return
        }

        const updatedResponse = {
            ...reasonAction,
            responseMessageContent: {
                html: convertToHTML(content),
                text,
            },
        }

        setIsDirty(true)
        setReasonAction(updatedResponse)

        if (
            content.getPlainText().length > MAX_AUTOMATED_RESPONSE_LENGTH &&
            !isResponseTooLong
        ) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        'Maximum number of characters exceeded. Please review your message',
                })
            )
        }

        setIsResponseTooLong(
            content.getPlainText().length > MAX_AUTOMATED_RESPONSE_LENGTH
        )
    }

    const handleDeleteClick = async () => {
        if (!configuration) {
            return
        }

        const newConfiguration = produce(
            configuration,
            (draftConfiguration) => {
                const policyCase =
                    draftConfiguration.report_issue_policy.cases[
                        Number(caseIndex)
                    ]

                policyCase.reasons = [
                    ...policyCase.reasons.slice(0, reasonIndex),
                    ...policyCase.reasons.slice(reasonIndex + 1),
                ]
            }
        )

        try {
            const res = await updateSelfServiceConfiguration(newConfiguration)
            void dispatch(selfServiceConfigurationUpdated(res))
            void (await dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Option successfully deleted.',
                })
            ))

            history.push(linkToScenario)
        } catch (error) {
            void (await dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Could not delete option, please try again later.',
                })
            ))
        }
        //
    }

    const wasItHelpfulToggleDisabled =
        !reasonAction?.responseMessageContent?.text

    const toggleWasItHelpful = () => {
        if (wasItHelpfulToggleDisabled || !reasonAction) {
            return
        }

        setIsDirty(true)
        setReasonAction({
            ...reasonAction,
            showHelpfulPrompt: !reasonAction.showHelpfulPrompt,
        })
    }

    const handleSwitchOption = (option: string) => {
        const optionIndex = caseOptions.findIndex(({value}) => value === option)

        if (optionIndex === undefined) {
            return
        }

        const linkToOption = `/app/settings/self-service/${integrationType}/${shopName}/preferences/report-issue/${caseIndex}/reasons/${optionIndex}`

        history.push(linkToOption)
    }

    if (isLoadingConfig || !reasonKey || !reasonAction) {
        return null
    }

    const handleDiscardChanges = () => {
        if (modalNextUrl) {
            setIsDirty(false)
            setModalNextUrl(undefined)
            unblockRef.current && unblockRef.current()
            history.push(modalNextUrl)
        }
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/self-service">
                                Self-service
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>{shopName}</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <SelfServicePreferencesNavbar />

            <Container fluid className={settingsCss.pageContainer}>
                <Modal
                    isOpen={modalNextUrl !== undefined}
                    onClose={() => setModalNextUrl(undefined)}
                    size="medium"
                >
                    <ModalHeader title={'Save changes?'} />
                    <ModalBody>
                        Your changes to this page will be lost if you don’t save
                        them.
                    </ModalBody>
                    <ModalActionsFooter
                        extra={
                            <Button
                                intent="destructive"
                                onClick={handleDiscardChanges}
                            >
                                Discard Changes
                            </Button>
                        }
                    >
                        <Button
                            intent="secondary"
                            onClick={() => setModalNextUrl(undefined)}
                        >
                            Back To Editing
                        </Button>

                        <Button
                            intent="primary"
                            onClick={() => {
                                void saveChanges().then(() => {
                                    if (modalNextUrl) {
                                        setModalNextUrl(undefined)
                                        history.push(modalNextUrl)
                                    }
                                })
                            }}
                        >
                            Save Changes
                        </Button>
                    </ModalActionsFooter>
                </Modal>

                <Row>
                    <Col>
                        <Button
                            onClick={() => {
                                if (isDirty) {
                                    setModalNextUrl(linkToScenario)
                                } else {
                                    history.push(linkToScenario)
                                }
                            }}
                            className={css.backButton}
                            fillStyle="ghost"
                            intent="secondary"
                        >
                            <ButtonIconLabel icon="arrow_back">
                                Back to scenario
                            </ButtonIconLabel>
                        </Button>

                        <Form
                            onSubmit={(e) => {
                                e.preventDefault()
                                void saveChanges()
                            }}
                            className={css.form}
                        >
                            <FormGroup className={css.formGroup}>
                                <InputField
                                    name="title"
                                    label="Order scenario"
                                    value={caseTitle}
                                    readOnly={true}
                                />
                            </FormGroup>

                            <FormGroup className={css.formGroup}>
                                <Label
                                    for="selectOption"
                                    className="control-label"
                                >
                                    Option
                                </Label>

                                <SelectField
                                    id="selectOption"
                                    value={reasonKey}
                                    options={caseOptions}
                                    onChange={(e) =>
                                        handleSwitchOption(e as string)
                                    }
                                    style={{width: '100%'}}
                                    fullWidth
                                />
                            </FormGroup>

                            <FormGroup className={css.formGroup}>
                                <Label
                                    for="responseText"
                                    className="control-label"
                                >
                                    Response text
                                </Label>
                                <p>
                                    After customers choose the option above,
                                    reply with an automated message.
                                </p>
                                <DEPRECATED_RichField
                                    value={{
                                        html: reasonAction
                                            .responseMessageContent.html,
                                    }}
                                    allowExternalChanges={true}
                                    onChange={handleResponseChange}
                                    placeholder="Add a response"
                                />
                                <FormText
                                    color={
                                        isResponseTooLong ? 'danger' : 'muted'
                                    }
                                >
                                    {`${
                                        reasonAction.responseMessageContent.text
                                            .length ?? 0
                                    }/${MAX_AUTOMATED_RESPONSE_LENGTH} characters`}
                                </FormText>
                                <TicketAttachments
                                    removable
                                    attachments={newMessageAttachments}
                                    deleteAttachment={deleteAttachment}
                                    className="p-2 d-flex flex-wrap"
                                />
                            </FormGroup>

                            <div className={css.helpfulToggle}>
                                <ToggleInput
                                    isToggled={reasonAction.showHelpfulPrompt}
                                    isDisabled={wasItHelpfulToggleDisabled}
                                    onClick={toggleWasItHelpful}
                                />
                                <div
                                    className={css.helpfulToggleDescription}
                                    onClick={toggleWasItHelpful}
                                >
                                    <span className={css.helpfulToggleName}>
                                        Ask shoppers if your response was
                                        helpful
                                    </span>
                                    <span
                                        className={css.helpfulToggleSubscript}
                                    >
                                        A ticket is created only if shoppers
                                        need more help
                                    </span>
                                </div>
                            </div>

                            <div className={css.buttonsWrapper}>
                                <div
                                    className={css.submitButtonWrapper}
                                    id="reasonSubmitButtonWrapper"
                                >
                                    <Button isDisabled={!isDirty} type="submit">
                                        Save changes
                                    </Button>
                                </div>

                                <ConfirmButton
                                    className={css.deleteButton}
                                    confirmationContent="You are about to delete this option."
                                    onConfirm={handleDeleteClick}
                                    intent="destructive"
                                >
                                    <ButtonIconLabel icon="delete">
                                        Delete Option
                                    </ButtonIconLabel>
                                </ConfirmButton>
                            </div>
                        </Form>
                    </Col>

                    <Col xs="auto">
                        <ReportIssuePreview
                            mode={previewMode}
                            setMode={setPreviewMode}
                            reasonOptions={caseOptions}
                            reportIssueReason={reasonKey}
                            automatedResponse={
                                reasonAction.responseMessageContent
                            }
                            newMessageAttachments={newMessageAttachments}
                            showHelpfulPrompt={
                                reasonAction.showHelpfulPrompt === true
                            }
                        />
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default ReportIssueReasonEditor
