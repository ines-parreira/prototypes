import React, {ComponentType, useState, useEffect, useMemo, useRef} from 'react'
import classNames from 'classnames'
import {
    Breadcrumb,
    BreadcrumbItem,
    Col,
    Container,
    Row,
    Form,
    UncontrolledTooltip,
} from 'reactstrap'
import {Link, useRouteMatch, useHistory} from 'react-router-dom'
import {UnregisterCallback} from 'history'
import produce from 'immer'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import {
    ReportIssueCaseReason,
    ReportIssueRulesLogic,
    SelfServiceReportIssueCase,
} from 'models/selfServiceConfiguration/types'
import {useConfigurationData} from 'pages/settings/selfService/components/hooks'
import useAppDispatch from 'hooks/useAppDispatch'
import {updateSelfServiceConfiguration} from 'models/selfServiceConfiguration/resources'
import {selfServiceConfigurationUpdated} from 'state/entities/selfServiceConfigurations/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import settingsCss from 'pages/settings/settings.less'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'

import SelfServicePreferencesNavbar from '../SelfServicePreferencesNavbar'
import BackButton from '../BackButton'
import Reasons from './components/Reasons'
import Conditions from './components/Conditions'
import Preview from './components/Preview'
import css from './ReportIssueCaseEditor.less'

type ErrorFormState = {
    [key in keyof SelfServiceReportIssueCase]?: string
}

const isReportIssueRulesLogic = (
    conditions: Record<string, unknown>
): conditions is ReportIssueRulesLogic => {
    return 'and' in conditions
}

const ReportIssueCaseEditor: ComponentType = () => {
    const {
        params: {shopName, integrationType, caseIndex},
    } = useRouteMatch<{
        shopName: string
        integrationType: string
        caseIndex: string
    }>()
    const history = useHistory()

    const [modalNextUrl, setModalNextUrl] = useState<string | undefined>(
        undefined
    )

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [reasons, setReasons] = useState<ReportIssueCaseReason[]>([])

    const [conditionsLogicExpession, setConditionsLogicExpression] =
        useState<ReportIssueRulesLogic>({and: []})

    const linkToIssueList = `/app/settings/self-service/${integrationType}/${shopName}/preferences/report-issue/`

    const [errors, setErrors] = useState<ErrorFormState>({})
    const [isDirty, setIsDirty] = useState(false)

    const dispatch = useAppDispatch()
    const {isLoadingConfig, configuration} = useConfigurationData()

    const unblockRef = useRef<UnregisterCallback>()

    const automatedResponsesEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.SelfServiceAutomatedResponseOrderManagement]

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

    const isFallbackCase = useMemo(() => {
        if (
            configuration &&
            Number(caseIndex) ===
                configuration.report_issue_policy.cases.length - 1
        ) {
            return true
        }

        return false
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoadingConfig, configuration, caseIndex])

    useEffect(() => {
        if (configuration && !isLoadingConfig && caseIndex !== 'new') {
            const caseData =
                configuration.report_issue_policy.cases[Number(caseIndex)]

            if (!caseData) {
                return
            }

            setTitle(caseData.title)
            setDescription(caseData.description)
            setReasons(caseData.reasons)
            if (isReportIssueRulesLogic(caseData.conditions)) {
                setConditionsLogicExpression(caseData.conditions)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoadingConfig, configuration])

    useEffect(() => {
        const newErrors: Partial<ErrorFormState> = {}
        if (!title) {
            newErrors.title = 'Title is required'
        } else if (title.length > 20) {
            newErrors.title = 'Title is limited to 20 characters'
        }

        const reasonsOrConditionsError =
            'Add at least one conditional statement and one reason to save this condition'
        if (!reasons.length) {
            newErrors.reasons = reasonsOrConditionsError
        }
        if (!isFallbackCase && !conditionsLogicExpession.and.length) {
            newErrors.conditions = reasonsOrConditionsError
        }

        setErrors(newErrors)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, reasons, conditionsLogicExpession, configuration, isDirty])

    const handleTitleChange = (newTitle: string) => {
        setIsDirty(true)
        setTitle(newTitle)
    }

    const handleDescriptionChange = (newDescription: string) => {
        setIsDirty(true)
        setDescription(newDescription)
    }

    const handleSubmit = async () => {
        if (!configuration) {
            return
        }

        // This is used to highlight the newly created case in the list when
        // returning to it
        let newlyCreatedCaseIndex: number | null = null

        const newConfiguration = produce(
            configuration,
            (draftConfiguration) => {
                const caseConfiguration = {
                    title,
                    description,
                    conditions: isFallbackCase ? {} : conditionsLogicExpession,
                    reasons,
                }

                if (caseIndex === 'new') {
                    newlyCreatedCaseIndex =
                        draftConfiguration.report_issue_policy.cases.length - 1

                    draftConfiguration.report_issue_policy.cases.splice(
                        configuration.report_issue_policy.cases.length - 1,
                        0,
                        caseConfiguration
                    )
                } else {
                    draftConfiguration.report_issue_policy.cases[
                        Number(caseIndex)
                    ] = caseConfiguration
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
                    message: 'Policy successfully updated.',
                })
            ))
        } catch (error) {
            void (await dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Could not update policy, please try again later.',
                })
            ))
        }

        if (caseIndex === 'new') {
            if (newlyCreatedCaseIndex === null) {
                history.push(linkToIssueList)
            } else {
                history.push(linkToIssueList, {
                    newlyCreatedCaseIndex,
                })
            }
        }
    }

    const handleCancelClick = () => {
        history.push(linkToIssueList)
    }

    const handleDeleteClick = async () => {
        if (!configuration) {
            return
        }

        const newConfiguration = produce(
            configuration,
            (draftConfiguration) => {
                draftConfiguration.report_issue_policy.cases.splice(
                    Number(caseIndex),
                    1
                )
            }
        )

        try {
            const res = await updateSelfServiceConfiguration(newConfiguration)
            void dispatch(selfServiceConfigurationUpdated(res))
            void (await dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Policy successfully updated.',
                })
            ))
        } catch (error) {
            void (await dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Could not update policy, please try again later.',
                })
            ))
        }

        history.push(linkToIssueList)
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
                                void handleSubmit().then(() => {
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
                        <BackButton
                            path={`/app/settings/self-service/${integrationType}/${shopName}/preferences/report-issue`}
                        >
                            Back to all scenarios
                        </BackButton>
                        <Form
                            onSubmit={(e) => {
                                e.preventDefault()
                                void handleSubmit()
                            }}
                            className={css.form}
                        >
                            <DEPRECATED_InputField
                                name="title"
                                label="Order scenario"
                                placeholder="Order scenario"
                                required
                                value={title}
                                onChange={handleTitleChange}
                                error={
                                    isDirty && errors.title
                                        ? errors.title
                                        : undefined
                                }
                                disabled={isFallbackCase}
                            />

                            <DEPRECATED_InputField
                                name="description"
                                label="Description"
                                placeholder='Ex: When order status is "delivered"'
                                value={description}
                                onChange={handleDescriptionChange}
                                disabled={isFallbackCase}
                            />

                            <fieldset className={css.fieldset}>
                                <legend className={css.legend}>
                                    What options should be displayed to
                                    shoppers?
                                </legend>

                                <Reasons
                                    reasons={reasons}
                                    allowEdit={
                                        caseIndex !== 'new' &&
                                        automatedResponsesEnabled === true
                                    }
                                    onChange={(updatedReasons) => {
                                        setIsDirty(true)
                                        setReasons(updatedReasons)
                                    }}
                                />
                            </fieldset>

                            {!isFallbackCase && (
                                <fieldset className={css.fieldset}>
                                    <legend className={css.legend}>
                                        Conditions to display these options
                                        <span
                                            className={classNames(
                                                'icon',
                                                'material-icons-outlined',
                                                css.tooltipIcon
                                            )}
                                            id="conditionsInfoIcon"
                                        >
                                            info
                                        </span>
                                        <UncontrolledTooltip
                                            placement="top"
                                            target="conditionsInfoIcon"
                                        >
                                            Select either order, fulfillment{' '}
                                            <b>or</b> shipment statuses{' '}
                                            <b>and</b> specific financial
                                            statuses (which applies to all) for
                                            a given set of issue reasons
                                        </UncontrolledTooltip>
                                    </legend>

                                    <Conditions
                                        logicExpression={
                                            conditionsLogicExpession
                                        }
                                        onChange={setConditionsLogicExpression}
                                    />
                                </fieldset>
                            )}

                            <div className={css.buttonsWrapper}>
                                <div
                                    className={css.submitButtonWrapper}
                                    id="caseSubmitButtonWrapper"
                                >
                                    <Button
                                        isDisabled={
                                            Object.keys(errors).length > 0
                                        }
                                        type="submit"
                                    >
                                        {caseIndex === 'new'
                                            ? 'Add new scenario'
                                            : 'Save changes'}
                                    </Button>
                                </div>

                                {Object.keys(errors).length > 0 && (
                                    <UncontrolledTooltip
                                        placement="top"
                                        target="caseSubmitButtonWrapper"
                                    >
                                        {Object.values(errors)[0]}
                                    </UncontrolledTooltip>
                                )}

                                <Button
                                    intent="secondary"
                                    onClick={handleCancelClick}
                                >
                                    Cancel
                                </Button>

                                {!isFallbackCase && caseIndex !== 'new' && (
                                    <ConfirmButton
                                        className={css.deleteButton}
                                        confirmationContent="You are about to delete this case."
                                        onConfirm={handleDeleteClick}
                                        intent="destructive"
                                    >
                                        <ButtonIconLabel icon="delete">
                                            Delete case
                                        </ButtonIconLabel>
                                    </ConfirmButton>
                                )}
                            </div>
                        </Form>
                    </Col>

                    <Col xs="auto">
                        <Preview reasons={reasons} />
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default ReportIssueCaseEditor
