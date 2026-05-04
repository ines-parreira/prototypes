import {
    Box,
    Button,
    Icon,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { SELECTABLE_REASONS_DROPDOWN_OPTIONS } from 'models/selfServiceConfiguration/constants'
import type {
    ReportIssueCaseReason,
    ReportIssueCaseReasonAction,
} from 'models/selfServiceConfiguration/types'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import SortableAccordionHeader from 'pages/common/components/accordion/SortableAccordionHeader'

import { SCENARIO_REASON_DEFAULT_ACTION } from '../constants'
import { ScenarioReasonAction } from './ScenarioReasonAction'

type Props = {
    value: ReportIssueCaseReason
    onChange: (nextValue: ReportIssueCaseReason) => void
    onDelete: (reasonKey: string) => void
}

export const ScenarioReasonItem = ({ value, onChange, onDelete }: Props) => {
    const reasonLabel = SELECTABLE_REASONS_DROPDOWN_OPTIONS.find(
        (option) => option.value === value.reasonKey,
    )?.label

    const isEmpty =
        !value.action?.responseMessageContent.text &&
        !value.action?.responseMessageContent.html

    const handleActionChange = (nextAction: ReportIssueCaseReasonAction) => {
        onChange({ ...value, action: nextAction })
    }

    const handleDelete = () => {
        onDelete(value.reasonKey)
    }

    return (
        <>
            <SortableAccordionHeader>
                <Box alignItems="center" gap="xs">
                    <Text size="md">{reasonLabel}</Text>
                    {isEmpty && (
                        <Tooltip
                            trigger={
                                <div>
                                    <Icon
                                        name="triangle-warning"
                                        size="sm"
                                        color="content-warning-default"
                                    />
                                </div>
                            }
                        >
                            <TooltipContent title="Response is not configured for this issue option." />
                        </Tooltip>
                    )}
                </Box>
            </SortableAccordionHeader>
            <AccordionBody>
                <Box flexDirection="column" gap="sm" p="sm">
                    <ScenarioReasonAction
                        reasonKey={value.reasonKey}
                        value={value.action ?? SCENARIO_REASON_DEFAULT_ACTION}
                        onChange={handleActionChange}
                    />
                    <Box justifyContent="flex-end">
                        <Button
                            variant="tertiary"
                            intent="destructive"
                            size="sm"
                            onClick={handleDelete}
                        >
                            <Box alignItems="center" gap="xxs">
                                <Icon name="trash-empty" size="sm" />
                                <span>Delete</span>
                            </Box>
                        </Button>
                    </Box>
                </Box>
            </AccordionBody>
        </>
    )
}
