import React, {ReactNode} from 'react'
import {Button} from 'reactstrap'

import {CampaignTrigger} from '../../types/CampaignTrigger'
import {DeleteTriggerFn} from '../../types/AdvancedTriggerBaseProps'

import css from './style.less'

type Props = {
    children: ReactNode
    id: string
    isFirst?: boolean
    trigger: CampaignTrigger
    onDeleteTrigger?: DeleteTriggerFn
}

export const BaseTriggerRow = ({
    children,
    id,
    isFirst = false,
    trigger,
    onDeleteTrigger,
}: Props): JSX.Element => {
    return (
        <div className={css.triggerWrapper}>
            {!isFirst && (
                <Button className="btn-frozen" color="warning" tag="div">
                    AND
                </Button>
            )}
            {children}
            {onDeleteTrigger && (
                <div
                    className={css.closeWrapper}
                    data-testid={`btn-delete-${trigger.key}`}
                    onClick={() => onDeleteTrigger(id)}
                >
                    <i className="material-icons md-2 text-danger">clear</i>
                </div>
            )}
        </div>
    )
}
