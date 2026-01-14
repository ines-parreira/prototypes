import { useState } from 'react'

import { Box, ButtonGroup, ButtonGroupItem, Heading } from '@gorgias/axiom'

import { ShoppingAssistantChannelTable } from './ShoppingAssistantChannelTable'
import { ShoppingAssistantTopProductsTable } from './ShoppingAssistantTopProductsTable'

import css from './PerformanceBreakdownTable.less'

const PerformanceTab = {
    channel: 'Channel',
    topProductRecommended: 'Top products recommended',
}

export const ShoppingAssistantPerformanceBreakdownTable = () => {
    const [activeTab, setActiveTab] = useState<string>('channel')

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
                onSelectionChange={setActiveTab}
            >
                <ButtonGroupItem id="channel">
                    {PerformanceTab.channel}
                </ButtonGroupItem>
                <ButtonGroupItem id="top-products-recommended">
                    {PerformanceTab.topProductRecommended}
                </ButtonGroupItem>
            </ButtonGroup>
            <Box
                className={css.tableContainer}
                display="flex"
                flexDirection="column"
                minWidth="0px"
            >
                {activeTab === 'channel' && <ShoppingAssistantChannelTable />}
                {activeTab === 'top-products-recommended' && (
                    <ShoppingAssistantTopProductsTable />
                )}
            </Box>
        </Box>
    )
}
