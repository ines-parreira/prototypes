import type { ReactNode } from 'react'
import { forwardRef, useRef } from 'react'

import { Box, Heading, TabItem, TabList, Tabs } from '@gorgias/axiom'

import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import css from 'domains/reporting/pages/common/layout/AnalyticsPage.less'
import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'
import { useSearchParam } from 'hooks/useSearchParam'

type TabConfig = {
    param: string
    title: string
}

type AnalyticsPageProps = {
    title: ReactNode
    titleExtra?: ReactNode
    banner?: ReactNode
    tabs?: readonly TabConfig[]
    tabParamName?: string
    activeTab?: string
    defaultTab?: string
    onTabChangeCallback?: (params: {
        tabParam: string
        previousTab: string | null
    }) => void
    filtersSlot?: ReactNode
    children: ReactNode
    canduId?: string
}

export const AnalyticsPage = forwardRef<HTMLDivElement, AnalyticsPageProps>(
    (
        {
            title,
            titleExtra,
            banner,
            tabs,
            tabParamName,
            activeTab,
            defaultTab,
            onTabChangeCallback,
            filtersSlot,
            children,
            canduId = 'stat-header-container',
        },
        ref,
    ) => {
        const headerRef = useRef(null)
        useInjectStyleToCandu(headerRef.current)
        const hasTabs = tabs && tabs.length > 0

        const [currentTab, setTabParam] = useSearchParam(tabParamName || '')

        const handleTabChange = (tabParam: string | number) => {
            if (!tabParamName) return

            if (onTabChangeCallback) {
                onTabChangeCallback({
                    tabParam: tabParam.toString(),
                    previousTab: currentTab,
                })
            }

            setTabParam(tabParam.toString())
        }

        return (
            <Box
                ref={ref}
                display="flex"
                flexDirection="column"
                flex={1}
                minWidth="0px"
                className={css.container}
            >
                <Box
                    flexDirection="column"
                    justifyContent="space-between"
                    className={css.stickyHeader}
                    paddingBottom={!!filtersSlot ? '12px' : 0}
                >
                    <Box
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        padding="lg"
                    >
                        {typeof title === 'string' ? (
                            <Heading
                                size="lg"
                                data-candu-id={canduId}
                                ref={headerRef}
                            >
                                {title}
                            </Heading>
                        ) : (
                            title
                        )}
                        {titleExtra}
                    </Box>
                    {hasTabs && (
                        <Box
                            width="100%"
                            display="flex"
                            flexDirection="column"
                            marginLeft="-8px"
                        >
                            <Tabs
                                selectedItem={activeTab || defaultTab}
                                onSelectionChange={handleTabChange}
                            >
                                <TabList>
                                    {tabs.map(({ param, title }) => (
                                        <TabItem
                                            key={param}
                                            id={param}
                                            label={title}
                                        />
                                    ))}
                                </TabList>
                            </Tabs>
                        </Box>
                    )}
                    {banner && (
                        <Box
                            display="flex"
                            flexDirection="column"
                            paddingRight="lg"
                            paddingLeft="lg"
                            paddingTop={hasTabs ? 'md' : 0}
                        >
                            {banner}
                        </Box>
                    )}
                    {filtersSlot && (
                        <Box padding="lg" paddingTop="md" paddingBottom="0px">
                            {filtersSlot}
                        </Box>
                    )}
                </Box>
                <Box
                    display="flex"
                    flexDirection="column"
                    flex={1}
                    minWidth="0px"
                    className={css.content}
                >
                    {children}
                    <DrillDownModal isLegacy={false} />
                </Box>
            </Box>
        )
    },
)
