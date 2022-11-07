import React from 'react'
import classnames from 'classnames'

import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

type Props = {
    isActionInProgress?: boolean
    isCampaignValid?: boolean
    isUpdate?: boolean
    onSave: () => void
    onDelete: () => void
}

export const CampaignFooter = ({
    isActionInProgress = false,
    isCampaignValid = false,
    isUpdate = false,
    onSave,
    onDelete,
}: Props): JSX.Element => {
    return (
        <div>
            <Button
                intent="primary"
                aria-label={isUpdate ? 'Save' : 'Create & activate'}
                className={classnames({
                    'btn-loading': isActionInProgress,
                })}
                isLoading={isActionInProgress}
                isDisabled={!isCampaignValid}
                onClick={onSave}
            >
                {isUpdate ? 'Save' : 'Create & activate'}
            </Button>
            {isUpdate && (
                <ConfirmButton
                    className="float-right"
                    placement="bottom-end"
                    onConfirm={onDelete}
                    confirmationContent="Are you sure you want to delete this campaign?"
                    intent="destructive"
                    isDisabled={isActionInProgress}
                >
                    <ButtonIconLabel icon="delete">
                        Delete campaign
                    </ButtonIconLabel>
                </ConfirmButton>
            )}
        </div>
    )
}
