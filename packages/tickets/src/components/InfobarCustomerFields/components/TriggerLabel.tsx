import { Text, Tooltip, TooltipContent } from '@gorgias/axiom'

import css from '../InfobarCustomerFields.less'

type TriggerLabelProps = {
    label: string
    tooltipText?: string
}

export function TriggerLabel({ label, tooltipText }: TriggerLabelProps) {
    const textElement = (
        <Text size="md" overflow="ellipsis" className={css.fieldValue}>
            {label}
        </Text>
    )

    if (!tooltipText) {
        return textElement
    }

    return (
        <Tooltip trigger={<span role="button">{textElement}</span>}>
            <TooltipContent title={tooltipText} />
        </Tooltip>
    )
}
