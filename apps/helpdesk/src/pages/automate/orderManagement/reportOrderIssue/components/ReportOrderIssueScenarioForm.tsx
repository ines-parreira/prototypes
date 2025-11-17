import { LegacyLabel as Label } from '@gorgias/axiom'

import type {
    ReportIssueCaseReason,
    SelfServiceReportIssueCase,
} from 'models/selfServiceConfiguration/types'
import InputField from 'pages/common/forms/input/InputField'

import {
    SCENARIO_DESCRIPTION_MAX_LENGTH,
    SCENARIO_NAME_MAX_LENGTH,
} from '../constants'
import ReportOrderIssueScenarioConditions from './ReportOrderIssueScenarioConditions'
import { usePropagateError } from './ReportOrderIssueScenarioFormContext'
import ReportOrderIssueScenarioReasons from './ReportOrderIssueScenarioReasons'

import css from './ReportOrderIssueScenarioForm.less'

type Props = {
    value: SelfServiceReportIssueCase
    expandedReason: ReportIssueCaseReason['reasonKey'] | null
    onExpandedReasonChange: (
        expandedReason: ReportIssueCaseReason['reasonKey'] | null,
    ) => void
    onHoveredReasonChange: (
        hoveredReason: ReportIssueCaseReason['reasonKey'] | null,
    ) => void
    isFallback: boolean
    onPreviewChange: (nextValue: SelfServiceReportIssueCase) => void
    onChange: (nextValue: SelfServiceReportIssueCase) => void
}

const ReportOrderIssueScenarioForm = ({
    value,
    expandedReason,
    onExpandedReasonChange,
    onHoveredReasonChange,
    isFallback,
    onPreviewChange,
    onChange,
}: Props) => {
    const titleHasError =
        !value.title.length || value.title.length > SCENARIO_NAME_MAX_LENGTH
    const descriptionHasError =
        value.description.length > SCENARIO_DESCRIPTION_MAX_LENGTH
    const reasonsHasError = !value.newReasons.length

    usePropagateError('title', titleHasError)
    usePropagateError('description', descriptionHasError)
    usePropagateError('reasons', reasonsHasError)

    const handleNameChange = (nextName: string) => {
        onPreviewChange({ ...value, title: nextName })
    }
    const handleDescriptionChange = (nextDescription: string) => {
        onPreviewChange({ ...value, description: nextDescription })
    }
    const handleConditionsChange = (
        nextConditions: SelfServiceReportIssueCase['conditions'],
    ) => {
        onPreviewChange({ ...value, conditions: nextConditions })
    }
    const handleReasonsPreviewChange = (
        nextReasons: ReportIssueCaseReason[],
    ) => {
        onPreviewChange({ ...value, newReasons: nextReasons })
    }
    const handleReasonsChange = (nextReasons: ReportIssueCaseReason[]) => {
        onChange({ ...value, newReasons: nextReasons })
    }

    return (
        <div className={css.container}>
            <div>
                <InputField
                    value={value.title}
                    onChange={handleNameChange}
                    label="Scenario name"
                    isRequired
                    caption="Ex: Delivered"
                    maxLength={SCENARIO_NAME_MAX_LENGTH}
                    isDisabled={isFallback}
                />
                <InputField
                    className={css.description}
                    value={value.description}
                    onChange={handleDescriptionChange}
                    label="Scenario description"
                    caption="Ex: When order status is delivered"
                    maxLength={SCENARIO_DESCRIPTION_MAX_LENGTH}
                    isDisabled={isFallback}
                />
            </div>
            {!isFallback && (
                <div>
                    <Label isRequired>Order conditions</Label>
                    <div className={css.orderConditionsDescription}>
                        The options below will display when an order meets the
                        following conditions.
                    </div>
                    <ReportOrderIssueScenarioConditions
                        value={value.conditions}
                        onChange={handleConditionsChange}
                    />
                </div>
            )}
            <div className={css.reasonsContainer}>
                <Label isRequired>Issue options</Label>
                <ReportOrderIssueScenarioReasons
                    items={value.newReasons}
                    expandedItem={expandedReason}
                    onExpandedItemChange={onExpandedReasonChange}
                    onHoveredItemChange={onHoveredReasonChange}
                    onPreviewChange={handleReasonsPreviewChange}
                    onChange={handleReasonsChange}
                />
            </div>
        </div>
    )
}

export default ReportOrderIssueScenarioForm
