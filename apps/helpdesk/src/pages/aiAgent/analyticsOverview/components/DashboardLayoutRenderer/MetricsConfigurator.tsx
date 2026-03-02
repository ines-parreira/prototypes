import { useState } from 'react'

import { ConfigureMetricsModal } from '@repo/reporting'
import type { MetricConfigItem } from '@repo/reporting'

import { Box, Button } from '@gorgias/axiom'

type MetricsConfiguratorProps = {
    metrics: MetricConfigItem[]
}

export const MetricsConfigurator = ({ metrics }: MetricsConfiguratorProps) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    return (
        <Box alignItems="center" gap="sm" justifyContent="flex-end" flex={1}>
            <Button
                key="settings"
                size="sm"
                variant="tertiary"
                leadingSlot="columns"
                onClick={() => setIsEditModalOpen(true)}
            >
                Edit metrics
            </Button>
            <ConfigureMetricsModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                maxVisibleMetric={8}
                metrics={metrics}
                onSave={() => {
                    // TODO - save the new configuration in #ANALYT-5234
                }}
            />
        </Box>
    )
}
