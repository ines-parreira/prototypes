import React, {useCallback, useMemo, useState} from 'react'
import classnames from 'classnames'

import {Tooltip} from '@gorgias/ui-kit'

import {useDismissFlag} from 'hooks/useDismissFlag'

import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import {useCampaignFormContext} from 'pages/convert/campaigns/hooks/useCampaignFormContext'

import {ABVariantModalType} from 'pages/convert/abVariants/types/enums'
import CreateABTestInfoModal from 'pages/convert/abVariants/components/CreateABTestInfoModal'

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
    isOverLimit?: boolean
    isCreateDisabled?: boolean
    isUpdate?: boolean
    disableActions?: boolean
    canCreateABVariants?: boolean
    aBVariantsDisabled?: boolean

    onSave: (activate?: boolean) => void
    onDiscard?: () => void
    onDelete?: () => void
    onDuplicate?: () => void
    onABVariantCreate?: () => void
}

export const CampaignFooter = ({
    integrationId,
    actionInProgress = '',
    isCampaignValid = false,
    isLightCampaign = false,
    isShopifyStore = false,
    isOverLimit = false,
    isCreateDisabled = false,
    isUpdate = false,
    disableActions = false,
    canCreateABVariants = false,
    aBVariantsDisabled = false,
    onSave,
    onDiscard,
    onDelete,
    onDuplicate,
    onABVariantCreate,
}: Props): JSX.Element => {
    const [isLightModalOpen, setIsLightModalOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const {configuration} = useCampaignFormContext()

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
        if (onABVariantCreate) {
            onABVariantCreate()
        }
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
                        aria-label={
                            configuration?.labels?.Update ?? 'Update Campaign'
                        }
                        className={classnames({
                            'btn-loading': actionInProgress === 'update',
                        })}
                        isLoading={actionInProgress === 'update'}
                        isDisabled={
                            disableActions ||
                            !isCampaignValid ||
                            actionInProgress !== ''
                        }
                        onClick={() => onSave()}
                    >
                        {configuration?.labels?.Update ?? 'Update Campaign'}
                    </Button>

                    {(!isShopifyStore || !isLightCampaign) &&
                        !isCreateDisabled &&
                        onDuplicate && (
                            <>
                                <Button
                                    id="duplicate-button"
                                    intent="secondary"
                                    aria-label={
                                        configuration?.labels?.Duplicate ??
                                        'Duplicate Campaign'
                                    }
                                    className={classnames({
                                        'btn-loading':
                                            actionInProgress === 'duplicate',
                                    })}
                                    isLoading={actionInProgress === 'duplicate'}
                                    isDisabled={
                                        disableActions ||
                                        isOverLimit ||
                                        actionInProgress !== ''
                                    }
                                    onClick={() => onDuplicate()}
                                >
                                    {configuration?.labels?.Duplicate ??
                                        'Duplicate Campaign'}
                                </Button>
                                {isOverLimit && (
                                    <Tooltip target="duplicate-button">
                                        You can only have a max of 3 variants
                                        (including the control). You can delete
                                        variants from the Test Settings page.
                                    </Tooltip>
                                )}
                            </>
                        )}

                    {(!isShopifyStore || !isLightCampaign) &&
                        !isCreateDisabled &&
                        canCreateABVariants && (
                            <>
                                <Button
                                    id="create-ab-variant-button"
                                    intent="secondary"
                                    aria-label="Create A/B Test"
                                    isDisabled={
                                        disableActions || aBVariantsDisabled
                                    }
                                    onClick={onCreateButtonClick}
                                    className={classnames({
                                        'btn-loading':
                                            actionInProgress ===
                                            'createVariant',
                                    })}
                                >
                                    Create A/B Test
                                </Button>
                                {aBVariantsDisabled && (
                                    <Tooltip target="create-ab-variant-button">
                                        Converting a scheduled campaign into an
                                        A/B test isn’t possible.
                                    </Tooltip>
                                )}
                            </>
                        )}
                </div>

                {!isLightCampaign && onDelete && (
                    <>
                        {!isOverLimit || lightModalDismissed ? (
                            <ConfirmButton
                                placement="bottom-end"
                                onConfirm={onDelete}
                                confirmationContent="Are you sure you want to delete this campaign?"
                                intent="destructive"
                                isDisabled={disableActions}
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
                                    isDisabled={disableActions}
                                    data-testid="delete-icon-button" // used in e2e tests
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

                {!isDismissed && (
                    <CreateABTestInfoModal
                        isOpen={isModalOpen}
                        onClose={closeModal}
                        isDismissed={isDismissed}
                        isLoading={actionInProgress === 'createVariant'}
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
                <Button
                    onClick={() => onCreate(false)}
                    title="Create"
                    isLoading={actionInProgress === 'create'}
                    isDisabled={
                        disableActions || !isCampaignValid || isCreateDisabled
                    }
                    className={classnames({
                        'btn-loading': actionInProgress === 'create',
                    })}
                >
                    {configuration?.labels?.Create ?? 'Create'}
                </Button>
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
