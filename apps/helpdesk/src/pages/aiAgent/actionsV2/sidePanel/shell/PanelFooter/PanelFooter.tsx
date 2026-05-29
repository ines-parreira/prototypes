import type { ReactElement } from 'react'

import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import css from './PanelFooter.less'

type Props = {
    onDismiss?: () => void
    onSubmit?: () => void
    submitLabel?: string
    dismissLabel?: string
    isSubmitting?: boolean
    isSubmitDisabled?: boolean
    isDismissDisabled?: boolean
    disabledTooltip?: string
}

export const PanelFooter = ({
    onDismiss,
    onSubmit,
    submitLabel = 'Save and enable',
    dismissLabel = 'Dismiss',
    isSubmitting = false,
    isSubmitDisabled = false,
    isDismissDisabled = false,
    disabledTooltip,
}: Props) => {
    const shouldShowTooltip = Boolean(
        disabledTooltip && isSubmitDisabled && !isSubmitting,
    )

    const withTooltip = (button: ReactElement) =>
        shouldShowTooltip ? (
            <Tooltip trigger={button}>
                <TooltipContent title={disabledTooltip!} />
            </Tooltip>
        ) : (
            button
        )

    const isDismissBlocked = isSubmitting || isDismissDisabled

    return (
        <footer className={css.footer}>
            {onDismiss &&
                withTooltip(
                    <Button
                        as="button"
                        variant="tertiary"
                        intent="regular"
                        onClick={onDismiss}
                        isDisabled={isDismissBlocked}
                        aria-disabled={isDismissBlocked || undefined}
                    >
                        {dismissLabel}
                    </Button>,
                )}
            {onSubmit &&
                withTooltip(
                    <Button
                        as="button"
                        variant="primary"
                        intent="regular"
                        onClick={onSubmit}
                        isLoading={isSubmitting}
                        isDisabled={isSubmitDisabled}
                        aria-disabled={isSubmitDisabled || undefined}
                    >
                        {submitLabel}
                    </Button>,
                )}
        </footer>
    )
}
