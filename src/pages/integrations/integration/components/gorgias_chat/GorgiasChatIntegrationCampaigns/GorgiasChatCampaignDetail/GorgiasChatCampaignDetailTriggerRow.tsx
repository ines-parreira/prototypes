import React from 'react'
import {Map} from 'immutable'
import {Button} from 'reactstrap'

import {CAMPAIGNS_TRIGGER_KEYS} from '../../../../../../../config/integrations/gorgias_chat'
import SelectField from '../../../../../../common/forms/SelectField/SelectField'
import {
    SelectableOption,
    Value,
} from '../../../../../../common/forms/SelectField/types'

import {GorgiasChatCampaignDetailValueInput} from './GorgiasChatCampaignDetailValueInput'
import css from './GorgiasChatCampaignDetailTriggerRow.less'

type Props = {
    trigger: Map<any, any>
    idx: number
    onOperatorChange: (operator: Value) => void
    onValueChange: (value: Value) => void
    onDelete: () => void
}

export const GorgiasChatCampaignDetailTriggerRow = ({
    trigger,
    idx,
    onOperatorChange,
    onValueChange,
    onDelete,
}: Props) => {
    const keyConfig: Map<any, any> = (
        CAMPAIGNS_TRIGGER_KEYS as Map<any, any>
    ).find(
        (config) => (config as Map<any, any>).get('name') === trigger.get('key')
    )

    const currentOperator = trigger.get('operator')
    const operators: Map<any, any> = keyConfig.get('operators')
    const defaultOperator = operators.keySeq().get(0)
    const operatorOptions: SelectableOption[] = operators
        .map((operatorData: Map<any, any>, operator) => {
            return {
                value: operator,
                text: operator,
                label: operatorData.get('label'),
            }
        })
        .toList()
        .toJS()
    const isFirstCondition = idx === 0

    return (
        <div key={idx} className={css.triggerWrapper}>
            {!isFirstCondition && (
                <Button className="btn-frozen" color="warning" tag="div">
                    AND
                </Button>
            )}
            <Button className="btn-frozen" tag="div">
                {keyConfig.get('label')}
            </Button>
            {operatorOptions.length === 1 ? (
                <div className={css.fixedOperator}>
                    {operatorOptions[0].label}
                </div>
            ) : (
                <SelectField
                    onChange={onOperatorChange}
                    value={
                        operators.keySeq().includes(currentOperator)
                            ? currentOperator
                            : defaultOperator
                    }
                    options={operators
                        .map((operatorData: Map<any, any>, operator) => {
                            return {
                                value: operator,
                                text: operator,
                                label: operatorData.get('label'),
                            }
                        })
                        .toList()
                        .toJS()}
                />
            )}
            <GorgiasChatCampaignDetailValueInput
                keyConfig={keyConfig}
                trigger={trigger}
                onChange={onValueChange}
                className={css.last}
            />
            {trigger.get('key') !== 'business_hours' && (
                <div className={css.closeWrapper} onClick={onDelete}>
                    <i className="material-icons md-2 text-danger">clear</i>
                </div>
            )}
        </div>
    )
}
