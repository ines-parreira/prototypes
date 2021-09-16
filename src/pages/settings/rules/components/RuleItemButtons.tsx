import React from 'react'
import {Button} from 'reactstrap'
import classnames from 'classnames'

import ConfirmButton from '../../../common/components/ConfirmButton'

import css from './RuleItemButtons.less'

type Props = {
    ruleId?: number
    canSubmit: boolean
    canDuplicate: boolean
    isDeleting: boolean
    onDuplicate: () => void
    onDelete: () => void
    onSubmit: () => void
}

export const RuleItemButtons = ({
    ruleId,
    canSubmit,
    canDuplicate,
    isDeleting,
    onDuplicate,
    onDelete,
    onSubmit,
}: Props) => {
    return (
        <div className={css['buttons-container']}>
            <div>
                <Button
                    id={`rule-item-save`}
                    color="success"
                    onClick={onSubmit}
                    disabled={!canSubmit}
                    form={`rule-form`}
                >
                    {ruleId ? 'Update rule' : 'Create rule'}
                </Button>
                {ruleId && (
                    <Button
                        id={`rule-item-duplicate`}
                        color="secondary"
                        type="submit"
                        className="ml-3"
                        disabled={!canDuplicate}
                        onClick={onDuplicate}
                    >
                        Duplicate rule
                    </Button>
                )}
            </div>
            {ruleId && (
                <div>
                    <ConfirmButton
                        id={`rule-item-delete`}
                        color="secondary"
                        className={classnames('ml-2', css['delete-button'])}
                        loading={isDeleting}
                        confirm={onDelete}
                        confirmColor="danger"
                        content={'Are you sure you want to delete this rule?'}
                    >
                        <i className="material-icons">delete</i>
                        Delete rule
                    </ConfirmButton>
                </div>
            )}
        </div>
    )
}

export default RuleItemButtons
