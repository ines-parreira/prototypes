import React from 'react'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'

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
                    onClick={onSubmit}
                    isDisabled={!canSubmit}
                    form={`rule-form`}
                    type="button"
                >
                    {ruleId ? 'Update rule' : 'Create rule'}
                </Button>
                {ruleId && (
                    <Button
                        id={`rule-item-duplicate`}
                        intent={ButtonIntent.Secondary}
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
                        intent={ButtonIntent.Destructive}
                        isLoading={isDeleting}
                        onConfirm={onDelete}
                        confirmationContent="Are you sure you want to delete this rule?"
                        type="button"
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
