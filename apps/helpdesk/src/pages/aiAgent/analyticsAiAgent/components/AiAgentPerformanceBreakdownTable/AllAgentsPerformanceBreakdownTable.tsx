import { useState } from 'react'

import { Box, ButtonGroup, ButtonGroupItem, Heading } from '@gorgias/axiom'

import { ChannelPerformanceBreakdownTable } from './ChannelPerformanceBreakdownTable'
import { IntentPerformanceBreakdownTable } from './IntentPerformanceBreakdownTable'

import css from './PerformanceBreakdownTable.less'

const PerformanceTab = {
    Channel: 'Channel',
    Intent: 'Intent',
} as const

type PerformanceTabKey = keyof typeof PerformanceTab

export const AllAgentsPerformanceBreakdownTable = () => {
    const [activeTab, setActiveTab] = useState<PerformanceTabKey>('Channel')

    return (
        <Box
            display="flex"
            flexDirection="column"
            flex={1}
            gap="xxxs"
            minWidth="0px"
        >
            <Box className={css.header}>
                <Heading size="sm" className={css.title}>
                    Performance breakdown
                </Heading>
            </Box>
            <ButtonGroup
                selectedKey={activeTab}
                onSelectionChange={(key) =>
                    setActiveTab(key as PerformanceTabKey)
                }
            >
                <ButtonGroupItem id="Channel">
                    {PerformanceTab.Channel}
                </ButtonGroupItem>
                <ButtonGroupItem id="Intent">
                    {PerformanceTab.Intent}
                </ButtonGroupItem>
            </ButtonGroup>
            {activeTab === 'Channel' ? (
                <ChannelPerformanceBreakdownTable />
            ) : (
                <IntentPerformanceBreakdownTable />
            )}
        </Box>
    )
}
