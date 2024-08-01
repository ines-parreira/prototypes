import React, {useCallback, useMemo, useRef, useState} from 'react'
import classnames from 'classnames'
import _noop from 'lodash/noop'

import {useDismissFlag} from 'hooks/useDismissFlag'

import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import DropdownButton from 'pages/common/components/button/DropdownButton'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import UncontrolledDropdown from 'pages/common/components/dropdown/UncontrolledDropdown'

import {ABVariantModalType} from 'pages/convert/abVariants/types/enums'
import CreateABTestInfoModal from 'pages/convert/abVariants/components/CreateABTestInfoModal'
import {useIsConvertABVariantsEnabled} from 'pages/convert/common/hooks/useIsConvertABVariantsEnabled'

import LightCampaignModal from 'pages/convert/campaigns/components/LightCampaignModal/LightCampaignModal'
import {LightCampaignModalType} from 'pages/convert/campaigns/types/enums/LightCampaignModalType'
import useLocalStorage from 'hooks/useLocalStorage'

import css from './style.less'

type Props = {
    integrationId: number
    actionInProgress?: string
    isCampaignValid?: boolean
    isLightCampaign?: boolean
    isShopifyStore?: boolean
    isOverCampaignsLimit?: boolean
    isCreateDisabled?: boolean
    isUpdate?: boolean
    onSave: (activate?: boolean) => void
    onDiscard?: () => void
    onDelete?: () => void
    onDuplicate?: () => void
}

export const CampaignFooter = ({
    integrationId,
    actionInProgress = '',
    isCampaignValid = false,
    isLightCampaign = false,
    isShopifyStore = false,
    isOverCampaignsLimit = false,
    isCreateDisabled = false,
    isUpdate = false,
    onSave,
    onDiscard,
    onDelete,
    onDuplicate,
}: Props): JSX.Element => {
    const [isLightModalOpen, setIsLightModalOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const dropdownTargetRef = useRef<HTMLDivElement>(null)
    const isABVariantEnabled = useIsConvertABVariantsEnabled()

    const storageAbVariantModalKey = useMemo(() => {
        return `convert:abVariant:${ABVariantModalType.CreateABGroup}`
    }, [])

    const {isDismissed, dismiss} = useDismissFlag(
        storageAbVariantModalKey,
        true
    )

    const storageKey = useMemo(() => {
        return `convert:lightModal:${integrationId}:${LightCampaignModalType.DeleteCampaign}`
    }, [integrationId])
    const [lightModalDismissed, setLightModalDismissed] = useLocalStorage<
        boolean | undefined
    >(storageKey)

    const onCreate = useCallback(
        (activate?: boolean) => {
            if (!isCreateDisabled) {
                onSave(activate)
            }
        },
        [onSave, isCreateDisabled]
    )

    const openModal = () => {
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }

    const createABGroup = () => {
        // Temporary
        // eslint-disable-next-line no-console
        console.log('Creating A/B Group...')
    }

    const onCreateButtonClick = () => {
        if (!isDismissed) {
            openModal()
            return
        }

        createABGroup()
    }

    const onModalSubmit = () => {
        createABGroup()
        closeModal()
    }

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
                        isDisabled={!isCampaignValid || actionInProgress !== ''}
                        onClick={() => onSave()}
                    >
                        Update Campaign
                    </Button>

                    {(!isShopifyStore || !isLightCampaign) &&
                        !isCreateDisabled &&
                        onDuplicate && (
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

                    {(!isShopifyStore || !isLightCampaign) &&
                        !isCreateDisabled &&
                        isABVariantEnabled && (
                            <Button
                                intent="secondary"
                                aria-label="Create A/B Test"
                                onClick={onCreateButtonClick}
                            >
                                Create A/B Test
                            </Button>
                        )}
                </div>

                {!isLightCampaign && onDelete && (
                    <>
                        {!isOverCampaignsLimit || lightModalDismissed ? (
                            <ConfirmButton
                                placement="bottom-end"
                                onConfirm={onDelete}
                                confirmationContent="Are you sure you want to delete this campaign?"
                                intent="destructive"
                                isDisabled={actionInProgress !== ''}
                                fillStyle="ghost"
                                className={classnames('float-right', {
                                    'btn-loading':
                                        actionInProgress === 'delete',
                                })}
                                isLoading={actionInProgress === 'delete'}
                            >
                                <ButtonIconLabel icon="delete">
                                    Delete Campaign
                                </ButtonIconLabel>
                            </ConfirmButton>
                        ) : (
                            <>
                                <Button
                                    onClick={() => setIsLightModalOpen(true)}
                                    fillStyle="ghost"
                                    intent="destructive"
                                    title="Delete campaign"
                                    data-testid="delete-icon-button"
                                    className={classnames('float-right', {
                                        'btn-loading':
                                            actionInProgress === 'delete',
                                    })}
                                >
                                    <ButtonIconLabel icon="delete">
                                        Delete Campaign
                                    </ButtonIconLabel>
                                </Button>
                                <LightCampaignModal
                                    modalType={
                                        LightCampaignModalType.DeleteCampaign
                                    }
                                    isOpen={isLightModalOpen}
                                    isDismissed={!!lightModalDismissed}
                                    setIsDismissed={setLightModalDismissed}
                                    isSubmitting={actionInProgress === 'delete'}
                                    onSubmit={onDelete}
                                    onClose={() => setIsLightModalOpen(false)}
                                />
                            </>
                        )}
                    </>
                )}

                {isABVariantEnabled && !isDismissed && (
                    <CreateABTestInfoModal
                        isOpen={isModalOpen}
                        onClose={closeModal}
                        isDismissed={isDismissed}
                        setIsDismissed={dismiss}
                        onSubmit={onModalSubmit}
                    />
                )}
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
                    isDisabled={!isCampaignValid || isCreateDisabled}
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
                            onClick={() => onCreate(false)}
                            shouldCloseOnSelect
                        />

                        <DropdownItem
                            option={{
                                label: 'Create & Activate',
                                value: 'create_activate',
                            }}
                            onClick={() => onCreate(true)}
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
