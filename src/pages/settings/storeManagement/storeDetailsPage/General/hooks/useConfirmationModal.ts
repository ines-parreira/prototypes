import { useCallback, useState } from 'react'

interface UseConfirmationModalProps {
    onSave: () => Promise<void>
    onReset: () => void
}

export function useConfirmationModal({
    onSave,
    onReset,
}: UseConfirmationModalProps) {
    const [isConfirmationModalShown, setIsConfirmationModalShown] =
        useState(false)

    const onConfirmationModalSave = async () => {
        try {
            await onSave()
        } finally {
            setIsConfirmationModalShown(false)
        }
    }

    const onConfirmationModalDiscard = () => {
        onReset()
        setIsConfirmationModalShown(false)
    }

    const showConfirmationModal = useCallback(() => {
        setIsConfirmationModalShown(true)
    }, [])

    return {
        isConfirmationModalShown,
        setIsConfirmationModalShown,
        onConfirmationModalSave,
        onConfirmationModalDiscard,
        showConfirmationModal,
    }
}
