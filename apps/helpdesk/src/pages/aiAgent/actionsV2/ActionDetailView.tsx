import type { Key } from 'react'
import { useEffect } from 'react'

import { useParams } from 'react-router-dom'

import {
    Box,
    Breadcrumb,
    Breadcrumbs,
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
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { SUPPORT_ACTIONS } from 'pages/aiAgent/constants'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import { ActionDetailHeader } from './components/ActionDetailHeader'
import type { ActionDetailTab } from './hooks/useActionDetailTab'
import { useActionDetailTab } from './hooks/useActionDetailTab'

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
                isLoading
                shopName={shopName}
                title={SUPPORT_ACTIONS}
            />
        )
    }

    if (!configuration) {
        return (
            <AiAgentLayout shopName={shopName} title={SUPPORT_ACTIONS}>
                <Box
                    role="alert"
                    aria-live="assertive"
                    p="lg"
                    flexDirection="column"
                    gap="sm"
                >
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
        <AiAgentLayout shopName={shopName} title={SUPPORT_ACTIONS}>
            <Box flexDirection="column" gap="md" p="md">
                <nav aria-label="Breadcrumb">
                    <Breadcrumbs>
                        <Breadcrumb>
                            <Link href={routes.actions}>Actions Library</Link>
                        </Breadcrumb>
                        <Breadcrumb aria-current="page">
                            {configuration.name}
                        </Breadcrumb>
                    </Breadcrumbs>
                </nav>
                <ActionDetailHeader configuration={configuration} />
                <Tabs
                    selectedItem={tab}
                    onSelectionChange={(key: Key) =>
                        setTab(key as ActionDetailTab)
                    }
                >
                    <TabList>
                        <TabItem id="usage" label="Usage" />
                        <TabItem id="config" label="Config" />
                    </TabList>
                    <TabPanel id="usage">
                        <Box p="lg">
                            <Text color="var(--content-neutral-secondary)">
                                Usage tab content coming soon.
                            </Text>
                        </Box>
                    </TabPanel>
                    <TabPanel id="config">
                        <Box p="lg">
                            <Text color="var(--content-neutral-secondary)">
                                Config tab content coming soon.
                            </Text>
                        </Box>
                    </TabPanel>
                </Tabs>
            </Box>
        </AiAgentLayout>
    )
}

export default ActionDetailView
