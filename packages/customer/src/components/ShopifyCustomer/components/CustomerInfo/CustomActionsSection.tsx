import { Box, Icon, Separator, Text } from '@gorgias/axiom'

import { AddCustomActionMenu } from './AddCustomActionMenu'
import type { ButtonConfig, LinkConfig } from './CustomActions'
import { CustomActionsList } from './CustomActionsList'

import css from './editPanels/IntermediateEditPanel.less'

type CustomActionsSectionProps = {
    integrationName?: string
    title?: string
    links: LinkConfig[]
    buttons: ButtonConfig[]
    onChange: (next: { links: LinkConfig[]; buttons: ButtonConfig[] }) => void
    isLoading: boolean
    isDisabled?: boolean
}

export function CustomActionsSection({
    integrationName,
    title,
    links,
    buttons,
    onChange,
    isLoading,
    isDisabled = false,
}: CustomActionsSectionProps) {
    const headerLabel = title ?? integrationName
    const hasActions = links.length > 0 || buttons.length > 0

    return (
        <>
            <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                padding="md"
            >
                <Box flexDirection="row" alignItems="center" gap="xs">
                    <Icon name="app-shopify" size="md" />
                    <Text size="md" variant="bold">
                        {headerLabel}
                    </Text>
                </Box>
                <AddCustomActionMenu
                    links={links}
                    buttons={buttons}
                    onChange={onChange}
                    isLoading={isLoading}
                    isDisabled={isDisabled}
                />
            </Box>
            {hasActions && (
                <>
                    <Separator />
                    <div className={css.section}>
                        <CustomActionsList
                            links={links}
                            buttons={buttons}
                            onChange={onChange}
                        />
                    </div>
                </>
            )}
        </>
    )
}
