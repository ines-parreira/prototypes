import React from 'react'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'

import css from './RuleItemButtons.less'

type Props = {
    ruleId?: number
    canSubmit: boolean
    canDuplicate: boolean
    canDelete: boolean
    isDeleting: boolean
    onDuplicate?: () => void
    onDelete: () => void
    onSubmit: () => void
}

export const RuleItemButtons = ({
    ruleId,
    canSubmit,
    canDuplicate,
    canDelete,
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
                    onClick={onSubmit}
                    isDisabled={!canSubmit}
                    form={`rule-form`}
                >
                    {ruleId ? 'Update rule' : 'Create rule'}
                </Button>
                {ruleId && !!onDuplicate && (
                    <Button
                        id={`rule-item-duplicate`}
                        intent="secondary"
                        type="submit"
                        className="ml-3"
                        isDisabled={!canDuplicate}
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
                        intent="destructive"
                        isLoading={isDeleting}
                        onConfirm={onDelete}
                        confirmationContent="Are you sure you want to delete this rule?"
                        isDisabled={!canDelete}
                    >
                        <ButtonIconLabel icon="delete">
                            Delete rule
                        </ButtonIconLabel>
                    </ConfirmButton>
                </div>
            )}
        </div>
    )
}

export default RuleItemButtons
