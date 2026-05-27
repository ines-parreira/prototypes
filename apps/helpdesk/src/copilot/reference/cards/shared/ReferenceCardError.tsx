import { Box, Card, Icon, Text } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import css from './ReferenceCardShell.less'

type Props = {
    icon: IconName
    typeLabel: string
    message: string
}

export function ReferenceCardError({ icon, typeLabel, message }: Props) {
    return (
        <Card
            flexDirection="column"
            gap="xxs"
            elevation="mid"
            p="md"
            width="100%"
        >
            <Box flexDirection="row" alignItems="center" gap="xxs">
                <Icon name={icon} size="xs" color="content-neutral-secondary" />
                <Text
                    size="xs"
                    variant="medium"
                    color="content-neutral-secondary"
                    className={css.typeLabel}
                >
                    {typeLabel}
                </Text>
            </Box>
            <Text size="sm" color="content-neutral-secondary">
                {message}
            </Text>
        </Card>
    )
}
