import type { Key } from 'react'
import { useEffect } from 'react'

import { useParams } from 'react-router-dom'

import {
    Box,
    Heading,
    Icon,
    Link,
    TabItem,
    TabList,
    TabPanel,
    Tabs,
    Text,
} from '@gorgias/axiom'

import { useGetStoreWorkflowsConfigurations } from 'models/workflows/queries'
import GuidanceReferenceProvider from 'pages/aiAgent/actions/providers/GuidanceReferenceProvider'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { SUPPORT_ACTIONS } from 'pages/aiAgent/constants'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import { ActionConfigTab } from './components/ActionConfigTab'
import { ActionDetailHeader } from './components/ActionDetailHeader'
import { ActionUsageTab } from './components/ActionUsageTab'
import type { ActionDetailTab } from './hooks/useActionDetailTab'
import { useActionDetailTab } from './hooks/useActionDetailTab'

import css from './ActionDetailView.less'

const getDocumentTitle = (actionName: string) => `Edit: ${actionName} — Actions`

const ActionDetailView = () => {
    const { shopName, shopType, id } = useParams<{
        shopName: string
        shopType: 'shopify'
        id: string
    }>()
    const { routes } = useAiAgentNavigation({ shopName })
    const { tab, setTab } = useActionDetailTab()

    const { data: configurations = [], isInitialLoading } =
        useGetStoreWorkflowsConfigurations(
            {
                storeName: shopName,
                storeType: shopType,
                triggers: ['llm-prompt'],
            },
            {},
            [id],
        )

    const configuration = configurations[0]

    useEffect(() => {
        if (!configuration?.name) {
            return
        }

        const previousTitle = document.title
        document.title = getDocumentTitle(configuration.name)
        return () => {
            document.title = previousTitle
        }
    }, [configuration?.name])

    if (isInitialLoading) {
        return (
            <AiAgentLayout
                fullscreen
                isLoading
                shopName={shopName}
                title={SUPPORT_ACTIONS}
                className={css.container}
            />
        )
    }

    if (!configuration) {
        return (
            <AiAgentLayout
                fullscreen
                shopName={shopName}
                title={SUPPORT_ACTIONS}
                className={css.container}
            >
                <Box role="alert" p="lg" flexDirection="column" gap="sm">
                    <Icon name="warning-triangle" color="red" />
                    <Heading size="md">Action not found</Heading>
                    <Text>
                        This action may have been deleted. Return to the Actions
                        library.
                    </Text>
                    <Link href={routes.actions}>Back to Actions</Link>
                </Box>
            </AiAgentLayout>
        )
    }

    return (
        <AiAgentLayout
            fullscreen
            shopName={shopName}
            title={SUPPORT_ACTIONS}
            className={css.container}
        >
            <Box flexDirection="column" gap="md" w="100%">
                <Box px="lg" pt="lg">
                    <ActionDetailHeader
                        configuration={configuration}
                        backHref={routes.actions}
                    />
                </Box>
                <Tabs
                    selectedItem={tab}
                    onSelectionChange={(key: Key) =>
                        setTab(key as ActionDetailTab)
                    }
                >
                    <TabList>
                        <TabItem id="config" label="Configuration" />
                        <TabItem id="usage" label="Usage" />
                    </TabList>
                    <TabPanel id="config">
                        <ActionConfigTab configuration={configuration} />
                    </TabPanel>
                    <TabPanel id="usage">
                        <GuidanceReferenceProvider actions={[configuration]}>
                            <ActionUsageTab configuration={configuration} />
                        </GuidanceReferenceProvider>
                    </TabPanel>
                </Tabs>
            </Box>
        </AiAgentLayout>
    )
}

export default ActionDetailView
