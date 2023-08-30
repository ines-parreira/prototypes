import React, {useRef} from 'react'
import classnames from 'classnames'
import _noop from 'lodash/noop'

import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import DropdownButton from 'pages/common/components/button/DropdownButton'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import UncontrolledDropdown from 'pages/common/components/dropdown/UncontrolledDropdown'

import {canSeeCampaignImprovements} from '../../utils/canSeeCampaignImprovements'

import css from './style.less'

type Props = {
    actionInProgress?: string
    isActionInProgress?: boolean
    isCampaignValid?: boolean
    isUpdate?: boolean
    onSave: (activate?: boolean) => void
    onDiscard?: () => void
    onDelete: () => void
    onDuplicate?: () => void
}

export const CampaignFooter = ({
    actionInProgress = '',
    isActionInProgress = false,
    isCampaignValid = false,
    isUpdate = false,
    onSave,
    onDiscard,
    onDelete,
    onDuplicate,
}: Props): JSX.Element => {
    const dropdownTargetRef = useRef<HTMLDivElement>(null)

    if (canSeeCampaignImprovements()) {
        if (isUpdate) {
            return (
                <div>
                    <div className={css.footerContainer}>
                        <Button
                            intent="primary"
                            aria-label="Update Campaign"
                            className={classnames({
                                'btn-loading': actionInProgress === 'update',
                            })}
                            isLoading={actionInProgress === 'update'}
                            isDisabled={
                                !isCampaignValid || actionInProgress !== ''
                            }
                            onClick={() => onSave()}
                        >
                            Update Campaign
                        </Button>

                        {onDuplicate && (
                            <Button
                                intent="secondary"
                                aria-label="Duplicate Campaign"
                                className={classnames({
                                    'btn-loading':
                                        actionInProgress === 'duplicate',
                                })}
                                isLoading={actionInProgress === 'duplicate'}
                                isDisabled={actionInProgress !== ''}
                                onClick={() => onDuplicate()}
                            >
                                Duplicate Campaign
                            </Button>
                        )}
                    </div>

                    <ConfirmButton
                        placement="bottom-end"
                        onConfirm={onDelete}
                        confirmationContent="Are you sure you want to delete this campaign?"
                        intent="destructive"
                        isDisabled={actionInProgress !== ''}
                        fillStyle="ghost"
                        className={classnames('float-right', {
                            'btn-loading': actionInProgress === 'delete',
                        })}
                        isLoading={actionInProgress === 'delete'}
                    >
                        <ButtonIconLabel icon="delete">
                            Delete campaign
                        </ButtonIconLabel>
                    </ConfirmButton>
                </div>
            )
        }

        return (
            <div className={css.footerContainer}>
                <div className={css.createBtnWrapper}>
                    <DropdownButton
                        color="primary"
                        fillStyle="fill"
                        ref={dropdownTargetRef}
                        isLoading={actionInProgress === 'create'}
                        isDisabled={!isCampaignValid}
                        className={classnames({
                            'btn-loading': actionInProgress === 'create',
                        })}
                        onToggleClick={_noop}
                    >
                        Create
                    </DropdownButton>
                    <UncontrolledDropdown
                        target={dropdownTargetRef}
                        placement="bottom-end"
                    >
                        <DropdownBody>
                            <DropdownItem
                                option={{
                                    label: 'Create',
                                    value: 'create',
                                }}
                                onClick={() => onSave(false)}
                                shouldCloseOnSelect
                            />

                            <DropdownItem
                                option={{
                                    label: 'Create & Activate',
                                    value: 'create_activate',
                                }}
                                onClick={() => onSave(true)}
                                shouldCloseOnSelect
                            />
                        </DropdownBody>
                    </UncontrolledDropdown>
                </div>
                {onDiscard && (
                    <div>
                        <Button intent="secondary" onClick={onDiscard}>
                            Cancel
                        </Button>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div>
            <Button
                intent="primary"
                aria-label={isUpdate ? 'Save Changes' : 'Create & activate'}
                className={classnames({
                    'btn-loading': isActionInProgress,
                })}
                isLoading={isActionInProgress}
                isDisabled={!isCampaignValid}
                onClick={() => onSave(true)}
            >
                {isUpdate ? 'Save Changes' : 'Create & activate'}
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
