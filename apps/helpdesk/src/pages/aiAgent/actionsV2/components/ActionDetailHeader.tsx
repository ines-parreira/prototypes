import { useCallback } from 'react'

import { useParams } from 'react-router-dom'

import {
    Box,
    Button,
    Heading,
    ToggleField,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { useUpsertAction } from 'pages/aiAgent/actions/hooks/useUpsertAction'
import { useGuidanceReferenceContext } from 'pages/aiAgent/actions/providers/GuidanceReferenceContext'
import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'
import { usePlaygroundPanel } from 'pages/aiAgent/hooks/usePlaygroundPanel'

type Props = {
    configuration: StoreWorkflowsConfiguration
}

export const ActionDetailHeader = ({ configuration }: Props) => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: 'shopify'
    }>()

    const { mutate: updateAction, isLoading: isEditActionLoading } =
        useUpsertAction('update', shopName, shopType)

    const { canBeDeleted } = useGuidanceReferenceContext()

    const { openPlayground } = usePlaygroundPanel()

    const isEnabled = !configuration.entrypoints[0]?.deactivated_datetime
    const isReferencedInGuidance = !canBeDeleted(configuration.id)
    const isEnableToggleDisabled = isReferencedInGuidance && isEnabled

    const handleToggle = useCallback(
        (nextValue: boolean) => {
            updateAction([
                {
                    internal_id: configuration.internal_id,
                    store_name: shopName,
                    store_type: shopType,
                },
                {
                    ...configuration,
                    entrypoints: configuration.entrypoints.map((entrypoint) =>
                        entrypoint.kind === 'llm-conversation'
                            ? {
                                  ...entrypoint,
                                  deactivated_datetime: nextValue
                                      ? null
                                      : new Date().toISOString(),
                              }
                            : entrypoint,
                    ),
                },
            ])
        },
        [configuration, shopName, shopType, updateAction],
    )

    return (
        <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            gap="md"
            w="100%"
        >
            <Box flexDirection="row" alignItems="center" gap="sm">
                <Heading size="xl">{configuration.name}</Heading>
            </Box>
            <Box flexDirection="row" alignItems="center" gap="sm">
                {isEnableToggleDisabled ? (
                    <Tooltip
                        trigger={
                            <ToggleField
                                label="Enabled"
                                value={isEnabled}
                                isDisabled
                                onChange={handleToggle}
                            />
                        }
                    >
                        <TooltipContent title="This Action is currently being used in Guidance. Remove the Action from all Guidance in order to disable." />
                    </Tooltip>
                ) : (
                    <ToggleField
                        label="Enabled"
                        value={isEnabled}
                        isDisabled={isEditActionLoading}
                        onChange={handleToggle}
                    />
                )}
                {isEnabled ? (
                    <Button
                        variant="secondary"
                        onClick={() => {
                            void openPlayground()
                        }}
                    >
                        Test
                    </Button>
                ) : (
                    <Tooltip
                        trigger={
                            <Button variant="secondary" isDisabled>
                                Test
                            </Button>
                        }
                    >
                        <TooltipContent title="Action must be enabled to test." />
                    </Tooltip>
                )}
            </Box>
        </Box>
    )
}
