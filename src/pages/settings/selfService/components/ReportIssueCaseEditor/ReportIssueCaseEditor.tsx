import React, {
    ComponentType,
    useState,
    useEffect,
    FormEvent,
    useMemo,
} from 'react'
import classNames from 'classnames'
import {useSelector} from 'react-redux'
import {bindActionCreators} from 'redux'
import {
    Breadcrumb,
    BreadcrumbItem,
    Col,
    Container,
    Row,
    Form,
    Button,
    UncontrolledTooltip,
} from 'reactstrap'
import {Link, useRouteMatch, useHistory} from 'react-router-dom'
import produce from 'immer'

import PageHeader from '../../../../common/components/PageHeader'
import InputField from '../../../../common/forms/InputField'

import {
    ReportIssueRulesLogic,
    SelfServiceReportIssueCase,
} from '../../../../../state/self_service/types'

import {useConfigurationData} from '../hooks'
import {getSelfServiceConfigurations} from '../../../../../state/self_service/selectors'
import {getIntegrationsByTypes} from '../../../../../state/integrations/selectors'
import {IntegrationType} from '../../../../../models/integration/types'
import {SelectableOption} from '../../../../common/forms/SelectField/types'
import * as SelfServiceActions from '../../../../../state/self_service/actions'
import useAppDispatch from '../../../../../hooks/useAppDispatch'

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
    const [conditionsLogicExpession, setConditionsLogicExpression] = useState<
        ReportIssueRulesLogic
    >({and: []})

    const [errors, setErrors] = useState<ErrorFormState>({})
    const [isDirty, setIsDirty] = useState(false)

    const selfServiceConfigurations = useSelector(getSelfServiceConfigurations)
    const shopifyIntegrations = useSelector(
        getIntegrationsByTypes(IntegrationType.ShopifyIntegrationType)
    )
    const dispatch = useAppDispatch()
    const actions = useMemo(() => {
        return bindActionCreators(SelfServiceActions, dispatch)
    }, [dispatch])
    const {isLoadingConfig, configuration} = useConfigurationData({
        selfServiceConfigurations,
        actions,
        shopifyIntegrations,
        matchParams: {shopName, integrationType},
    })

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

        await dispatch(
            SelfServiceActions.updateSelfServiceConfigurations(newConfiguration)
        )

        if (caseIndex === 'new') {
            const newCaseIndex =
                newConfiguration.report_issue_policy.cases.length - 2
            history.replace(
                `/app/settings/self-service/${integrationType}/${shopName}/preferences/report-issue/${newCaseIndex}`
            )
        }
    }

    const handleCancelClick = () => {
        history.goBack()
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

        await dispatch(
            SelfServiceActions.updateSelfServiceConfigurations(newConfiguration)
        )

        history.goBack()
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

            <Container fluid className="page-container">
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
                            />

                            <InputField
                                name="description"
                                label="Description"
                                placeholder='Ex. Condition Condition applied when status is "delivered"'
                                value={description}
                                onChange={handleDescriptionChange}
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
                                            Select either order fulfillment{' '}
                                            <b>or</b> shipment statuses,{' '}
                                            <b>and</b> specific financial
                                            statuses (which applies to all) for
                                            a given set of issue reasons.
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
                                        color="success"
                                        type="submit"
                                        disabled={
                                            Object.keys(errors).length > 0
                                        }
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
                                    type="button"
                                    onClick={handleCancelClick}
                                >
                                    Cancel
                                </Button>

                                {!isFallbackCase && caseIndex !== 'new' && (
                                    <Button
                                        type="button"
                                        className={css.deleteButton}
                                        color="secondary"
                                        onClick={handleDeleteClick}
                                    >
                                        <span
                                            className={classNames(
                                                'material-icons',
                                                css.deleteButtonIcon
                                            )}
                                        >
                                            delete
                                        </span>{' '}
                                        Delete
                                    </Button>
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
