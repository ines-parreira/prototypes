import React, {ReactNode} from 'react'
import classNames from 'classnames'

import {Button} from 'reactstrap'

import {CampaignTrigger} from '../../types/CampaignTrigger'
import {DeleteTriggerFn} from '../../types/AdvancedTriggerBaseProps'

import css from './style.less'

type Props = {
    children: ReactNode
    id: string
    isAllowedToEdit?: boolean
    isFirst?: boolean
    trigger: CampaignTrigger
    onDeleteTrigger?: DeleteTriggerFn
}

export const BaseTriggerRow = ({
    children,
    id,
    isAllowedToEdit = false,
    isFirst = false,
    trigger,
    onDeleteTrigger,
}: Props): JSX.Element => {
    const handleClickDelete = () => {
        onDeleteTrigger && onDeleteTrigger(id)
    }
    return (
        <div
            data-testid={`trigger-row-${trigger.key}`}
            className={css.triggerWrapper}
        >
            {!isFirst && (
                <Button className="btn-frozen" color="warning" tag="div">
                    AND
                </Button>
            )}
            {children}
            {onDeleteTrigger && (
                <div
                    className={classNames({
                        [css.closeWrapper]: true,
                        [css.hidden]: !isAllowedToEdit,
                    })}
                    data-testid={`btn-delete-${trigger.key}`}
                    onClick={handleClickDelete}
                >
                    <i className="material-icons md-2 text-danger">clear</i>
                </div>
            )}
        </div>
    )
}
