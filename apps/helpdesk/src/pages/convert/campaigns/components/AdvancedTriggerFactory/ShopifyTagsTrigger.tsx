import { useEffect, useState } from 'react'

import { Button } from '@gorgias/axiom'

import { Option } from 'pages/common/forms/MultiSelectOptionsField/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import { Value } from 'pages/common/forms/SelectField/types'
import { ShopifyCustomerTagsInput } from 'pages/convert/campaigns/components/ContactCaptureForm/ShopifyCustomerTagsInput'

import { AdvancedTriggerBaseProps } from '../../types/AdvancedTriggerBaseProps'
import { CampaignTriggerOperator } from '../../types/enums/CampaignTriggerOperator.enum'
import { convertTriggerOperatorsToSelectOptions } from '../../utils/convertTriggerOperatorsToSelectOptions'
import { handleTriggerOperatorChange } from '../../utils/handleTriggerOperatorChange'

import css from './style.less'

type Props = AdvancedTriggerBaseProps

export const ShopifyTagsTrigger = ({ id, trigger, onUpdateTrigger }: Props) => {
    const [innerOperator, setInnerOperator] = useState<CampaignTriggerOperator>(
        trigger.operator,
    )
    const [innerValue, setInnerValue] = useState<Option[]>([])

    const handleChangeOperator = (operator: Value) =>
        handleTriggerOperatorChange(
            operator,
            id,
            trigger,
            setInnerOperator,
            onUpdateTrigger,
        )

    const handleChangeValue = (value: Option[]) => {
        setInnerValue(value)
        onUpdateTrigger(id, {
            ...trigger,
            value: value.map((v) => v.value as string).toString(),
        })
    }

    useEffect(() => {
        setInnerOperator(trigger.operator)
        if (trigger.value) {
            setInnerValue(
                (trigger.value as string)
                    .split(',')
                    .map((v) => ({ value: v, label: v })),
            )
        }
    }, [trigger.operator, trigger.value])

    return (
        <>
            <div>
                <Button
                    intent="secondary"
                    aria-label="Customer shopify tags"
                    className="btn-frozen"
                >
                    Customer shopify tags
                </Button>
            </div>
            <SelectField
                value={innerOperator}
                onChange={handleChangeOperator}
                options={convertTriggerOperatorsToSelectOptions(trigger.type)}
            />
            <ShopifyCustomerTagsInput
                value={innerValue}
                className={css.customerTag}
                shouldFetchOnFocus={false}
                onChange={handleChangeValue}
                pluralText="customer tags"
                singularText="customer tag"
            />
        </>
    )
}
