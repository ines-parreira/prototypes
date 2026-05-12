import { Box, Button, Heading, Text } from '@gorgias/axiom'

import css from './PanelHeader.less'

type Props = {
    title: string
    description?: string
    backLink?: { label: string; onClick: () => void }
    titleId?: string
}

export const PanelHeader = ({
    title,
    description,
    backLink,
    titleId,
}: Props) => {
    return (
        <header className={css.header}>
            {backLink && (
                <div className={css.backLinkRow}>
                    <Button
                        as="button"
                        variant="tertiary"
                        size="sm"
                        intent="regular"
                        leadingSlot="arrow-undo-up-left"
                        onClick={backLink.onClick}
                    >
                        {backLink.label}
                    </Button>
                </div>
            )}
            <div className={css.titleRow}>
                <Box flexDirection="column" gap="xs" flexGrow={1}>
                    <Heading id={titleId} size="md">
                        {title}
                    </Heading>
                    {description && (
                        <Text size="sm" color="content-neutral-tertiary">
                            {description}
                        </Text>
                    )}
                </Box>
            </div>
        </header>
    )
}
