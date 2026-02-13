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
                    {tabs && tabs.length > 0 && (
                        <Box width="100%" display="flex" flexDirection="column">
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
                    {filtersSlot}
                </Box>
                <Box
                    display="flex"
                    flexDirection="column"
                    flex={1}
                    minWidth="0px"
                    className={css.content}
                >
                    {children}
                    <DrillDownModal />
                </Box>
            </Box>
        )
    },
)
