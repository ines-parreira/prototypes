import { useReducer } from 'react'

import {
    Box,
    Button,
    Modal,
    ModalSize,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import { useAppSelector } from 'hooks/useAppSelector'
import { ProductCancellationReasons } from 'pages/settings/new_billing/components/CancelProductModal/constants'
import {
    cancellationReasonsReducer,
    DEFAULT_STATE,
} from 'pages/settings/new_billing/components/CancelProductModal/reducers'
import type { CancellationReasonsState } from 'pages/settings/new_billing/components/CancelProductModal/types'
import { CancellationReasonsFields } from 'pages/settings/new_billing/components/CancelProductModal/UI/CancellationReasonsFields'
import { getCurrentUser } from 'state/currentUser/selectors'

type GatedCancellationModalProps = {
    isOpen: boolean
    onClose: () => void
    onSubmit: (reasonsState: CancellationReasonsState) => void
    bookACallUrl: string | null
}

export const GatedCancellationModal = ({
    isOpen,
    onClose,
    onSubmit,
    bookACallUrl,
}: GatedCancellationModalProps) => {
    const currentUser = useAppSelector(getCurrentUser)
    const userEmail: string = currentUser.get('email') ?? ''
    const [reasonsState, dispatchCancellationReasonsAction] = useReducer(
        cancellationReasonsReducer,
        DEFAULT_STATE,
    )

    const handleSubmit = () => {
        onSubmit(reasonsState)
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size={ModalSize.Md}>
            <OverlayHeader title="Tell us more about your cancellation request" />
            <OverlayContent>
                <Box flexDirection="column" gap="md">
                    <Text size="md" color="var(--content-neutral-secondary)">
                        Your Customer Success Manager will send you a reply at{' '}
                        <Text as="span" variant="bold">
                            {userEmail}
                        </Text>
                        . You can also book a call with them directly.
                    </Text>
                    <CancellationReasonsFields
                        reasons={ProductCancellationReasons}
                        reasonsState={reasonsState}
                        dispatchCancellationReasonsAction={
                            dispatchCancellationReasonsAction
                        }
                    />
                </Box>
            </OverlayContent>
            <OverlayFooter>
                <Box
                    flexDirection="row"
                    justifyContent="flex-end"
                    gap="sm"
                    width="100%"
                >
                    {bookACallUrl && (
                        <Button
                            variant="tertiary"
                            onClick={() => window.open(bookACallUrl, '_blank')}
                        >
                            Book a call
                        </Button>
                    )}
                    <Button
                        isDisabled={!reasonsState.completed}
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
