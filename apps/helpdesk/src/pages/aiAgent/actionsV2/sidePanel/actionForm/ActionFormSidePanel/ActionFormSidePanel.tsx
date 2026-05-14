import type { ReactNode } from 'react'

import {
    OverlayContent,
    OverlayHeader,
    SidePanel,
    SidePanelSize,
} from '@gorgias/axiom'

import { PanelFooter } from '../../shell'

type Props = {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    title: string
    description?: string
    onDismiss?: () => void
    onSubmit?: () => void
    submitLabel?: string
    dismissLabel?: string
    isSubmitting?: boolean
    isSubmitDisabled?: boolean
    children: ReactNode
}

export const ActionFormSidePanel = ({
    isOpen,
    onOpenChange,
    title,
    description,
    onDismiss,
    onSubmit,
    submitLabel,
    dismissLabel,
    isSubmitting,
    isSubmitDisabled,
    children,
}: Props) => {
    return (
        <SidePanel
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size={SidePanelSize.Md}
            isDismissable={false}
        >
            <OverlayHeader title={title} description={description} />
            <OverlayContent gap="md" flexDirection="column">
                {children}
            </OverlayContent>
            <PanelFooter
                onDismiss={onDismiss}
                onSubmit={onSubmit}
                submitLabel={submitLabel}
                dismissLabel={dismissLabel}
                isSubmitting={isSubmitting}
                isSubmitDisabled={isSubmitDisabled}
            />
        </SidePanel>
    )
}
