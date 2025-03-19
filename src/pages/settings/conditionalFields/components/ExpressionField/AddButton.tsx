import { CustomFieldConditionExpression } from '@gorgias/api-queries'

import { useWatch } from 'core/forms'
import Button from 'pages/common/components/button/Button'

export function AddButton({ onClick }: { onClick: () => void }) {
    const expression: CustomFieldConditionExpression[] = useWatch({
        name: 'expression',
    })
    const lastRuleField = expression[expression.length - 1]?.field
    return (
        <Button
            type="button"
            intent="secondary"
            onClick={onClick}
            isDisabled={lastRuleField === 0}
            trailingIcon="arrow_drop_down"
        >
            Add requirements
        </Button>
    )
}
