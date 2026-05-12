import { Button } from '@gorgias/axiom'

import css from './PanelFooter.less'

type Props = {
    onDismiss?: () => void
    onSubmit?: () => void
    submitLabel?: string
    dismissLabel?: string
    isSubmitting?: boolean
    isSubmitDisabled?: boolean
}

export const PanelFooter = ({
    onDismiss,
    onSubmit,
    submitLabel = 'Save and enable',
    dismissLabel = 'Dismiss',
    isSubmitting = false,
    isSubmitDisabled = false,
}: Props) => {
    return (
        <footer className={css.footer}>
            {onDismiss && (
                <Button
                    as="button"
                    variant="tertiary"
                    intent="regular"
                    onClick={onDismiss}
                    isDisabled={isSubmitting}
                >
                    {dismissLabel}
                </Button>
            )}
            {onSubmit && (
                <Button
                    as="button"
                    variant="primary"
                    intent="regular"
                    onClick={onSubmit}
                    isLoading={isSubmitting}
                    isDisabled={isSubmitDisabled}
                >
                    {submitLabel}
                </Button>
            )}
        </footer>
    )
}
