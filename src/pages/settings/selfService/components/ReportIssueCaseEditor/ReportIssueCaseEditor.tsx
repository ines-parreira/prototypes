import React, {
    ComponentType,
    useState,
    useEffect,
    FormEvent,
    useMemo,
} from 'react'
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
import produce from 'immer'

import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import InputField from 'pages/common/forms/InputField'
import {
    ReportIssueRulesLogic,
    SelfServiceReportIssueCase,
} from 'models/selfServiceConfiguration/types'
import {useConfigurationData} from 'pages/settings/selfService/components/hooks'
import {SelectableOption} from 'pages/common/forms/SelectField/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {updateSelfServiceConfiguration} from 'models/selfServiceConfiguration/resources'
import {selfServiceConfigurationUpdated} from 'state/entities/selfServiceConfigurations/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import settingsCss from 'pages/settings/settings.less'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import {SELECTABLE_REASONS_DROPDOWN_OPTIONS} from './constants'
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

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [reasonOptions, setReasonOptions] = useState<SelectableOption[]>([])
    const [conditionsLogicExpession, setConditionsLogicExpression] =
        useState<ReportIssueRulesLogic>({and: []})

    const linkToIssueList = `/app/settings/self-service/${integrationType}/${shopName}/preferences/report-issue/`

    const [errors, setErrors] = useState<ErrorFormState>({})
    const [isDirty, setIsDirty] = useState(false)

    const dispatch = useAppDispatch()
    const {isLoadingConfig, configuration} = useConfigurationData()

    const reasons = useMemo(() => {
        return reasonOptions.map((option) => option.value as string)
    }, [reasonOptions])

    const isFallbackCase = useMemo(() => {
        if (
            configuration &&
            Number(caseIndex) ===
                configuration.report_issue_policy.cases.length - 1
        ) {
            return true
        }

        return false
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
            setReasonOptions(
                caseData.reasons.map((reason) => {
                    return SELECTABLE_REASONS_DROPDOWN_OPTIONS.find(
                        (option) => option.value === reason
                    ) as SelectableOption
                })
            )
            if (isReportIssueRulesLogic(caseData.conditions)) {
                setConditionsLogicExpression(caseData.conditions)
            }
        }
    }, [isLoadingConfig, configuration])

    useEffect(() => {
        const newErrors: Partial<ErrorFormState> = {}
        if (!title) {
            newErrors.title = 'Title is required'
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
    }, [title, reasons, conditionsLogicExpession, configuration, isDirty])

    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle)
        setIsDirty(true)
    }

    const handleDescriptionChange = (newDescription: string) => {
        setDescription(newDescription)
        setIsDirty(true)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

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
                        <BreadcrumbItem>
                            <Link
                                to={`/app/settings/self-service/${integrationType}/${shopName}/preferences`}
                            >
                                {shopName}
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/settings/self-service/${integrationType}/${shopName}/preferences/report-issue`}
                            >
                                Report Issue
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {caseIndex === 'new' ? 'New case' : 'Edit case'}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />

            <Container fluid className={settingsCss.pageContainer}>
                <Row>
                    <Col>
                        <Form onSubmit={handleSubmit} className={css.form}>
                            <InputField
                                name="title"
                                label="Title"
                                placeholder="Condition title"
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

                            <InputField
                                name="description"
                                label="Description"
                                placeholder='Ex. Condition Condition applied when status is "delivered"'
                                value={description}
                                onChange={handleDescriptionChange}
                                disabled={isFallbackCase}
                            />

                            <fieldset className={css.fieldset}>
                                <legend className={css.legend}>
                                    What reasons should be displayed?
                                </legend>

                                <Reasons
                                    reasonsOptions={reasonOptions}
                                    onChange={setReasonOptions}
                                />
                            </fieldset>

                            {!isFallbackCase && (
                                <fieldset className={css.fieldset}>
                                    <legend className={css.legend}>
                                        Conditions to display these errors
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
                                            ? 'Add new case'
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
                        <Preview reasonOptions={reasonOptions} />
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default ReportIssueCaseEditor
