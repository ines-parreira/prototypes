import { Box, Button, Text } from '@gorgias/axiom'

import css from './ActivityCard.less'

type Props = {
    appName: string
    appIcon?: string
    message: string
    actionButtonLabel: string
    onActionClick: () => void
}

const ActivityCard = ({
    appName,
    appIcon,
    message,
    actionButtonLabel,
    onActionClick,
}: Props) => {
    return (
        <div
            role="group"
            aria-label={`${appName} — reconnection required`}
            className={css.card}
        >
            <Box flexDirection="column" gap="xs">
                <div className={css.titleRow}>
                    {appIcon ? (
                        <img
                            src={appIcon}
                            alt=""
                            aria-hidden="true"
                            className={css.icon}
                        />
                    ) : null}
                    <Text variant="bold">{appName}</Text>
                </div>
                <Text as="p" color="content-neutral-secondary">
                    {message}
                </Text>
            </Box>
            <div className={css.footer}>
                <Button
                    as="button"
                    variant="primary"
                    size="sm"
                    onClick={onActionClick}
                >
                    {actionButtonLabel}
                </Button>
            </div>
        </div>
    )
}

export { ActivityCard }
