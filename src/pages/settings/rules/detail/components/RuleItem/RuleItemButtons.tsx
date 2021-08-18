import React from 'react'
import {Button} from 'reactstrap'
import classnames from 'classnames'

import ConfirmButton from '../../../../../common/components/ConfirmButton'
import Errors from '../../../../../common/components/ast/Errors'

import css from './RuleItemButtons.less'

type Props = {
    ruleId: number
    shouldDisplayError: boolean
    isSubmitDisabled: boolean
    isResetting: boolean
    isDeleting: boolean
    onDuplicate: () => void
    onReset: () => void
    onDelete: () => void
}

export const RuleItemButtons = ({
    ruleId,
    shouldDisplayError,
    isSubmitDisabled,
    isResetting,
    isDeleting,
    onDuplicate,
    onReset,
    onDelete,
}: Props) => {
    return (
        <div className={css['buttons-container']}>
            <div>
                <Button
                    id={`rule-item-save-${ruleId}`}
                    color="success"
                    type="submit"
                    disabled={isSubmitDisabled}
                    form={`rule-form-${ruleId}`}
                >
                    Save rule
                </Button>
                <Button
                    id={`rule-item-duplicate-${ruleId}`}
                    color="secondary"
                    type="submit"
                    className="ml-3"
                    disabled={isSubmitDisabled}
                    onClick={onDuplicate}
                >
                    Duplicate rule
                </Button>
                <ConfirmButton
                    id={`rule-item-discard-${ruleId}`}
                    color="secondary"
                    className="ml-3"
                    loading={isResetting}
                    confirm={onReset}
                    content="Are you sure you want to reset this rule?"
                >
                    Discard changes
                </ConfirmButton>
                {shouldDisplayError && (
                    <Errors inline> * Name cannot be empty </Errors>
                )}
            </div>
            <div>
                <ConfirmButton
                    id={`rule-item-delete-${ruleId}`}
                    color="secondary"
                    className={classnames('ml-2', css['delete-button'])}
                    loading={isDeleting}
                    confirm={onDelete}
                    content={'Are you sure you want to delete this rule?'}
                >
                    <i className="material-icons">delete</i>
                    Delete rule
                </ConfirmButton>
            </div>
        </div>
    )
}

export default RuleItemButtons
