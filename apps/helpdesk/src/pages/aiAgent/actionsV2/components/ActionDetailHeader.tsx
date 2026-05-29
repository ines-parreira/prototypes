import { Link as RouterLink } from 'react-router-dom'

import {
    Box,
    Button,
    Heading,
    ToggleField,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

type Props = {
    configuration: StoreWorkflowsConfiguration
    backHref: string
}

const COMING_SOON_TOOLTIP = 'Coming soon'

export const ActionDetailHeader = ({ configuration, backHref }: Props) => {
    const isActive = !configuration.is_draft

    return (
        <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            gap="md"
            w="100%"
        >
            <Box flexDirection="row" alignItems="center" gap="sm">
                <Button
                    as={RouterLink}
                    to={backHref}
                    icon="arrow-left"
                    size="sm"
                    variant="secondary"
                    aria-label="Back to Actions Library"
                />
                <Heading size="xl">{configuration.name}</Heading>
            </Box>
            <Box flexDirection="row" alignItems="center" gap="sm">
                <Tooltip
                    trigger={
                        <ToggleField
                            label="Enabled"
                            value={isActive}
                            isDisabled
                            onChange={() => {}}
                        />
                    }
                >
                    <TooltipContent title={COMING_SOON_TOOLTIP} />
                </Tooltip>
                <Tooltip
                    trigger={
                        <Button
                            variant="secondary"
                            isDisabled
                            onClick={() => {}}
                        >
                            Test
                        </Button>
                    }
                >
                    <TooltipContent title={COMING_SOON_TOOLTIP} />
                </Tooltip>
            </Box>
        </Box>
    )
}
