import { useCallback, useState } from 'react'

import { history } from '@repo/routing'

import {
    Box,
    Button,
    Icon,
    ListItem,
    Modal,
    OverlayHeader,
    SelectField,
    Text,
} from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import { HELP_CENTER_SELECT_MODAL_OPEN } from 'pages/aiAgent/KnowledgeHub/constants'
import { useFaqHelpCenter } from 'pages/aiAgent/KnowledgeHub/EmptyState/useFaqHelpCenter'
import { useListenToDocumentEvent } from 'pages/aiAgent/KnowledgeHub/EmptyState/utils'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import css from './HelpCenterSelectModal.less'

export const HelpCenterSelectModal = () => {
    const [isOpen, setIsOpen] = useState(false)
    const dispatch = useAppDispatch()

    const {
        selectedHelpCenter,
        handleOnSave,
        shopName,
        isPendingCreateOrUpdate,
        faqHelpCenters,
        helpCenterItems,
        setHelpCenterId,
    } = useFaqHelpCenter()

    const toggleModal = useCallback(() => {
        setIsOpen((prev) => !prev)
    }, [])

    useListenToDocumentEvent(HELP_CENTER_SELECT_MODAL_OPEN, toggleModal)

    const handleConfirm = useCallback(async () => {
        if (selectedHelpCenter !== null) {
            try {
                const result = await handleOnSave({
                    shopName,
                    silentNotification: false,
                })
                if (result) {
                    toggleModal()
                }
            } catch {
                dispatch(
                    notify({
                        message:
                            'Failed to connect Help Center. Please try again.',
                        status: NotificationStatus.Error,
                        showDismissButton: true,
                    }),
                )
            }
        }
    }, [selectedHelpCenter, handleOnSave, shopName, toggleModal, dispatch])

    const goToHelpCenter = useCallback(() => {
        history.push('/app/settings/help-center')
    }, [])

    const handleHelpCenterChange = useCallback(
        (helpCenter: { id: number; name: string }) => {
            setHelpCenterId(helpCenter.id)
        },
        [setHelpCenterId],
    )

    const noHelpCenterBody = () => {
        return (
            <>
                <div>
                    <Text>
                        You must create a Help Center first in order to connect
                        it to AI Agent.
                    </Text>
                    <Text
                        size="sm"
                        className={css.link}
                        onClick={goToHelpCenter}
                    >
                        Go to Help Center settings
                        <Icon name="external-link" size="sm" />
                    </Text>
                </div>
                <Box
                    justifyContent="flex-end"
                    gap="sm"
                    className={css.modalActions}
                >
                    <Button
                        variant="primary"
                        isDisabled={selectedHelpCenter === null}
                        isLoading={isPendingCreateOrUpdate}
                        onClick={toggleModal}
                    >
                        Done
                    </Button>
                </Box>
            </>
        )
    }

    const selectHelpCenterBody = () => {
        return (
            <>
                <div>
                    <SelectField
                        label="Select a Help Center to connect to AI Agent."
                        placeholder="Select Help Center"
                        items={helpCenterItems}
                        onChange={handleHelpCenterChange}
                        value={selectedHelpCenter}
                    >
                        {(option) => (
                            <ListItem
                                label={option.name || ''}
                                key={option.id}
                            />
                        )}
                    </SelectField>
                </div>
                <Box
                    justifyContent="flex-end"
                    gap="sm"
                    className={css.modalActions}
                >
                    <Button
                        variant="tertiary"
                        onClick={toggleModal}
                        isDisabled={isPendingCreateOrUpdate}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                        isDisabled={selectedHelpCenter === null}
                        isLoading={isPendingCreateOrUpdate}
                    >
                        Confirm
                    </Button>
                </Box>
            </>
        )
    }

    const isSelectModal = faqHelpCenters.length > 0

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={toggleModal}
            size="lg"
            isDismissable
            aria-label="Connect Help Center Modal"
        >
            <OverlayHeader title="Connect Help Center" />
            {isSelectModal ? selectHelpCenterBody() : noHelpCenterBody()}
        </Modal>
    )
}
