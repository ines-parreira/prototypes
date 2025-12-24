import { Text, Tooltip, TooltipContent, TooltipTrigger } from '@gorgias/axiom'

import css from '../InfobarCustomerFields.less'

type TriggerLabelProps = {
    label: string
    tooltipText?: string
}

export function TriggerLabel({ label, tooltipText }: TriggerLabelProps) {
    const textElement = (
        <Text size="sm" overflow="ellipsis" className={css.fieldValue}>
            {label}
        </Text>
    )

    if (!tooltipText) {
        return textElement
    }

    return (
        <Tooltip>
            <TooltipTrigger>{textElement}</TooltipTrigger>
            <TooltipContent title={tooltipText} />
        </Tooltip>
    )
}
