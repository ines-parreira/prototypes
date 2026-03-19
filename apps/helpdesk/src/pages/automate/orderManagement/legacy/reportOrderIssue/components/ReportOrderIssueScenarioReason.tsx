import { LegacyButton as Button } from '@gorgias/axiom'

import { SELECTABLE_REASONS_DROPDOWN_OPTIONS } from 'models/selfServiceConfiguration/constants'
import type {
    ReportIssueCaseReason,
    ReportIssueCaseReasonAction,
} from 'models/selfServiceConfiguration/types'
import EmptyResponseMessageContentError from 'pages/automate/common/components/EmptyResponseMessageContentError'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import SortableAccordionHeader from 'pages/common/components/accordion/SortableAccordionHeader'

import { SCENARIO_REASON_DEFAULT_ACTION } from '../constants'
import ReportOrderIssueScenarioReasonAction from './ReportOrderIssueScenarioReasonAction'

import css from './ReportOrderIssueScenarioReason.less'

type Props = {
    value: ReportIssueCaseReason
    onPreviewChange: (nextValue: ReportIssueCaseReason) => void
    onDelete: (reasonKey: ReportIssueCaseReason['reasonKey']) => void
}

const ReportOrderIssueScenarioReason = ({
    value,
    onPreviewChange,
    onDelete,
}: Props) => {
    const handleActionChange = (nextAction: ReportIssueCaseReasonAction) => {
        onPreviewChange({
            ...value,
            action: nextAction,
        })
    }
    const handleDelete = () => {
        onDelete(value.reasonKey)
    }

    const reasonLabel = SELECTABLE_REASONS_DROPDOWN_OPTIONS.find(
        (option) => option.value === value.reasonKey,
    )?.label
    const isEmpty =
        !value.action?.responseMessageContent.text &&
        !value.action?.responseMessageContent.html

    return (
        <>
            <SortableAccordionHeader>
                <div className={css.header}>{reasonLabel}</div>
                {isEmpty && <EmptyResponseMessageContentError />}
            </SortableAccordionHeader>
            <AccordionBody>
                <ReportOrderIssueScenarioReasonAction
                    value={value.action ?? SCENARIO_REASON_DEFAULT_ACTION}
                    onChange={handleActionChange}
                />
                <div className={css.deleteButtonContainer}>
                    <Button
                        intent="destructive"
                        fillStyle="ghost"
                        onClick={handleDelete}
                        leadingIcon="delete"
                    >
                        Delete
                    </Button>
                </div>
            </AccordionBody>
        </>
    )
}

export default ReportOrderIssueScenarioReason
