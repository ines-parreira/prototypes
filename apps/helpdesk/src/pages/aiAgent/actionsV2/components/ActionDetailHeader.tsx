import { Box, Button, Heading, Icon, Tag, ToggleField } from '@gorgias/axiom'

import useGetAppImageUrl from 'pages/aiAgent/actions/hooks/useGetAppImageUrl'
import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

type Props = {
    configuration: StoreWorkflowsConfiguration
}

export const ActionDetailHeader = ({ configuration }: Props) => {
    const appIconUrl = useGetAppImageUrl(configuration.apps?.[0])
    const isActive = !configuration.is_draft

    const toggleLabel = isActive ? 'Disable action' : 'Enable action'

    return (
        <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            gap="md"
            w="100%"
        >
            <Box flexDirection="row" alignItems="center" gap="sm">
                {appIconUrl && (
                    <img
                        src={appIconUrl}
                        alt=""
                        width={24}
                        height={24}
                        aria-hidden="true"
                    />
                )}
                <Heading size="xl">{configuration.name}</Heading>
                <Tag color={isActive ? 'green' : 'grey'}>
                    {isActive ? 'Active' : 'Draft'}
                </Tag>
            </Box>
            <Box flexDirection="row" alignItems="center" gap="sm">
                <ToggleField
                    label={toggleLabel}
                    value={isActive}
                    onChange={() => {
                        // Wiring is a follow-up M2 ticket.
                    }}
                />
                <Button
                    variant="secondary"
                    icon={<Icon name="trash-empty" aria-hidden />}
                    aria-label="Delete action"
                    onClick={() => {
                        // Wiring is a follow-up M2 ticket.
                    }}
                />
            </Box>
        </Box>
    )
}
