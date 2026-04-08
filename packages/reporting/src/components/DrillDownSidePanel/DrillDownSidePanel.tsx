import type { PropsWithChildren, ReactNode } from 'react'

import {
    Box,
    Button,
    Icon,
    OverlayContent,
    OverlayHeader,
    SidePanel,
    SidePanelSize,
    Text,
} from '@gorgias/axiom'

type Props = {
    isOpen: boolean
    onClose: () => void
    title: string
    description?: string
    itemCount?: number
    learnMoreHref?: string
    size?: SidePanelSize
}

export const DrillDownSidePanel = ({
    isOpen,
    onClose,
    title,
    description,
    itemCount,
    learnMoreHref,
    size = SidePanelSize.Xl,
    children,
}: PropsWithChildren<Props>) => {
    const headerTitle: ReactNode = learnMoreHref ? (
        <Box flexDirection="row" alignItems="center" gap="sm">
            <span>{title}</span>
            <Button
                as="a"
                href={learnMoreHref}
                target="_blank"
                rel="noreferrer"
                variant="tertiary"
                size="sm"
                trailingSlot={<Icon name="external-link" />}
            >
                Learning resources
            </Button>
        </Box>
    ) : (
        title
    )

    return (
        <SidePanel isOpen={isOpen} onOpenChange={onClose} size={size}>
            <OverlayHeader title={headerTitle} description={description} />
            <OverlayContent gap={'md'} flexDirection={'column'}>
                {itemCount !== undefined && (
                    <Text
                        size="sm"
                        color="content-neutral-secondary"
                        variant="bold"
                    >
                        {itemCount} items
                    </Text>
                )}
                {children}
            </OverlayContent>
        </SidePanel>
    )
}
