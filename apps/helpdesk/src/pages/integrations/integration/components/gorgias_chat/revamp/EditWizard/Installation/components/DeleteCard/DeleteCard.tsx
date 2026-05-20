import { useState } from 'react'

import { fromJS } from 'immutable'
import type { List, Map } from 'immutable'

import {
    Button,
    ButtonIntent,
    ButtonSize,
    ButtonVariant,
    Card,
    Elevation,
    Heading,
    HeadingSize,
    Modal,
    ModalSize,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import type { deleteIntegration } from 'state/integrations/actions'

import css from './DeleteCard.less'

const DeleteCard = ({
    integration,
    onDeleteIntegration,
}: {
    integration: Map<any, any>
    onDeleteIntegration: typeof deleteIntegration
}) => {
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
        useState<boolean>(false)

    const [isDeleting, setIsDeleting] = useState(false)

    const shopIntegrationId = integration.getIn(['meta', 'shop_integration_id'])
        ? Number(integration.getIn(['meta', 'shop_integration_id']))
        : undefined
    const shopifyIntegrationIds: List<number> = integration.getIn(
        ['meta', 'shopify_integration_ids'],
        fromJS([]),
    )
    const isOneClickInstallation = shopIntegrationId
        ? shopifyIntegrationIds.includes(shopIntegrationId)
        : undefined

    const handleDeleteIntegration = async () => {
        setIsDeleting(true)

        await onDeleteIntegration(integration)

        setIsDeleteConfirmationOpen(false)
        setIsDeleting(false)
    }

    const handleModalOpenChange = (isOpen: boolean) => {
        if (!isDeleting) {
            setIsDeleteConfirmationOpen(isOpen)
        }
    }

    return (
        <Card elevation={Elevation.Mid}>
            <div className={css.deleteCard}>
                <div>
                    <Heading size={HeadingSize.Md}>Delete Chat</Heading>
                </div>
                <div className={css.cardDescription}>
                    <Text>
                        Permanently remove Chat from your account. All chat
                        settings and data will be lost.
                    </Text>
                </div>
                <div className={css.deleteButton}>
                    <Button
                        intent={ButtonIntent.Destructive}
                        size={ButtonSize.Md}
                        variant={ButtonVariant.Secondary}
                        onClick={() => setIsDeleteConfirmationOpen(true)}
                        data-testid="delete-chat-integration-button"
                    >
                        Delete chat
                    </Button>
                </div>
                <Modal
                    size={ModalSize.Md}
                    isOpen={isDeleteConfirmationOpen}
                    onOpenChange={handleModalOpenChange}
                >
                    <OverlayHeader title="Delete Chat ?" />
                    <OverlayContent>
                        <div>
                            <Text>
                                Deleting this chat will remove it from your
                                store and disable any associated views and
                                rules.
                            </Text>
                            {!isOneClickInstallation && (
                                <>
                                    <br />
                                    <br />
                                    <Text>
                                        For manually installed chats, you also
                                        need to delete the script from the
                                        store&apos;s theme, website code, or
                                        Google Tag Manager to remove it from
                                        your website.
                                    </Text>{' '}
                                </>
                            )}
                        </div>
                    </OverlayContent>
                    <OverlayFooter hideCancelButton>
                        <div className={css.deleteModalFooter}>
                            <Button
                                intent={ButtonIntent.Regular}
                                size={ButtonSize.Md}
                                variant={ButtonVariant.Secondary}
                                onClick={() =>
                                    setIsDeleteConfirmationOpen(false)
                                }
                                isDisabled={isDeleting}
                                data-testid="cancel-delete-chat-integration-button"
                            >
                                Cancel
                            </Button>
                            <Button
                                intent={ButtonIntent.Destructive}
                                size={ButtonSize.Md}
                                variant={ButtonVariant.Primary}
                                isLoading={isDeleting}
                                onClick={handleDeleteIntegration}
                                data-testid="delete-chat-integration-confirmation-button"
                            >
                                Delete chat
                            </Button>
                        </div>
                    </OverlayFooter>
                </Modal>
            </div>
        </Card>
    )
}

export default DeleteCard
