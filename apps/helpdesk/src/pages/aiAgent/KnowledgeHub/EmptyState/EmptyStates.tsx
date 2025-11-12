import { Box, Button, Card, Heading, Icon, Text } from '@gorgias/axiom'

import { GroupedKnowledgeItem, KnowledgeType, typeConfig } from '../types'

import css from './EmptyState.less'

export const EmptyStates = ({
    hasWebsiteSync = false,
    titleAlignment = 'center',
}: {
    hasWebsiteSync?: boolean
    titleAlignment?: string
}) => {
    return (
        <Box flexDirection="column" gap="xxl">
            {/* Top row*/}
            <Box
                flexDirection={'column'}
                gap="md"
                alignItems={titleAlignment}
                w={544}
            >
                <Heading size={'sm'}>Create new content</Heading>
                <Box flexDirection={'row'} gap="md">
                    <Card className={css.card}>
                        <Box flexDirection={'column'} gap="xs">
                            <Text size={'md'} variant={'bold'}>
                                <Box flexDirection={'row'} gap="xxxs">
                                    <Icon
                                        name={
                                            typeConfig[KnowledgeType.Guidance]
                                                .icon
                                        }
                                    />
                                    Guidance
                                </Box>
                            </Text>
                            <Text size={'sm'}>
                                Instruct AI Agent to handle customer requests
                                and follow internal processes.
                            </Text>
                        </Box>
                    </Card>
                    <Card className={css.card}>
                        <Box flexDirection={'column'} gap="xs">
                            <Text size={'md'} variant={'bold'}>
                                <Box flexDirection={'row'} gap="xxxs">
                                    <Icon
                                        name={
                                            typeConfig[KnowledgeType.FAQ].icon
                                        }
                                    />
                                    {typeConfig[KnowledgeType.FAQ].label}
                                </Box>
                            </Text>
                            <Text size={'sm'}>
                                Let AI Agent use published Help Center articles
                                as knowledge.
                            </Text>
                        </Box>
                    </Card>
                </Box>
            </Box>
            {/* Bottom row*/}
            <Box flexDirection={'column'} gap="md" alignItems={titleAlignment}>
                <Heading size={'sm'}>Sync or upload external content</Heading>
                <Box flexDirection={'row'} gap="md">
                    {!hasWebsiteSync && (
                        <Card>
                            <Box flexDirection={'column'} gap="xs">
                                <Text size={'md'} variant={'bold'}>
                                    <Box flexDirection={'row'} gap="xxxs">
                                        <Icon
                                            name={
                                                typeConfig[KnowledgeType.Domain]
                                                    .icon
                                            }
                                        />
                                        {typeConfig[KnowledgeType.Domain].label}
                                    </Box>
                                </Text>
                                <Text size={'sm'}>Sync your site content</Text>
                            </Box>
                        </Card>
                    )}

                    <Card>
                        <Box flexDirection={'column'} gap="xs">
                            <Text size={'md'} variant={'bold'}>
                                <Box flexDirection={'row'} gap="xxxs">
                                    <Icon
                                        name={
                                            typeConfig[KnowledgeType.URL].icon
                                        }
                                    />
                                    {typeConfig[KnowledgeType.URL].label}
                                </Box>
                            </Text>
                            <Text size={'sm'}>Sync single-page URLs</Text>
                        </Box>
                    </Card>
                    <Card>
                        <Box flexDirection={'column'} gap="xs">
                            <Text size={'md'} variant={'bold'}>
                                <Box flexDirection={'row'} gap="xxxs">
                                    <Icon
                                        name={
                                            typeConfig[KnowledgeType.Document]
                                                .icon
                                        }
                                    />
                                    {typeConfig[KnowledgeType.Document].label}
                                </Box>
                            </Text>
                            <Text size={'sm'}>Upload external files</Text>
                        </Box>
                    </Card>
                </Box>
            </Box>
        </Box>
    )
}

export const EmptyStateGuidance = () => {
    return (
        <Box
            flexDirection="column"
            gap="xs"
            alignItems="center"
            justifyContent="center"
            padding="xxxl"
            w={600}
        >
            <Heading size={'md'}>Get started with Guidance</Heading>
            <Box flexDirection="column" gap="md" alignItems="center">
                <Text size={'md'} align={'center'}>
                    Instruct AI Agent to handle customer requests and follow
                    end-to-end processes with internal-facing Guidance.
                </Text>
                <Button variant="primary">Create Guidance</Button>
            </Box>
        </Box>
    )
}

export const EmptyStateFAQ = ({
    helpCenterId,
    articles,
}: {
    helpCenterId?: number | null
    articles: GroupedKnowledgeItem[]
}) => {
    const EMPTY_STATE_CONTENT = {
        noHelpCenter: {
            title: 'Connect your Help Center',
            description:
                'Let AI Agent use your published Help Center articles as knowledge.',
            buttonText: 'Connect Help Center',
        },
        helpCenterWithoutArticles: {
            title: 'Get started with Help Center articles',
            description:
                'Let AI Agent use your published Help Center articles as knowledge.',
            buttonText: 'Create Help Center article',
        },
        helpCenterWithArticles: {
            title: 'Get started with Help Center articles',
            description:
                'Create and publish articles to make them available to AI Agent.',
            buttonText: 'Create Help Center article',
        },
    }

    const getStateKey = () => {
        if (!helpCenterId) return 'noHelpCenter'
        return articles.length > 0
            ? 'helpCenterWithArticles'
            : 'helpCenterWithoutArticles'
    }

    const content = EMPTY_STATE_CONTENT[getStateKey()]

    return (
        <Box
            flexDirection="column"
            gap="xs"
            alignItems="center"
            justifyContent="center"
            padding="xxxl"
            w={600}
        >
            <Heading size={'md'}>{content.title}</Heading>
            <Box flexDirection="column" gap="md" alignItems="center">
                <Text size={'md'} align={'center'}>
                    {content.description}
                </Text>
                <Button variant="primary">{content.buttonText}</Button>
            </Box>
        </Box>
    )
}

export const EmptyStateDomain = () => {
    return (
        <Box
            flexDirection="column"
            gap="xs"
            alignItems="center"
            justifyContent="center"
            padding="xxxl"
            w={600}
        >
            <Heading size={'md'}>Sync your store website</Heading>
            <Box flexDirection="column" gap="md" alignItems="center">
                <Text size={'md'} align={'center'}>
                    Use your website’s content and product pages as knowledge
                    for AI Agent.
                </Text>
                <Button variant="primary" leadingSlot="arrows-reload-alt-1">
                    Sync
                </Button>
            </Box>
        </Box>
    )
}

export const EmptyStateURL = () => {
    return (
        <Box
            flexDirection="column"
            gap="xs"
            alignItems="center"
            justifyContent="center"
            padding="xxxl"
            w={600}
        >
            <Heading size={'md'}>Add URLs</Heading>
            <Box flexDirection="column" gap="md" alignItems="center">
                <Text size={'md'} align={'center'}>
                    Add links to public pages AI Agent can learn from like blog
                    posts or external documentation.
                </Text>
                <Button variant="primary">Add URL</Button>
            </Box>
        </Box>
    )
}

export const EmptyStateDocument = () => {
    return (
        <Box
            flexDirection="column"
            gap="xs"
            alignItems="center"
            justifyContent="center"
            padding="xxxl"
            w={600}
        >
            <Heading size={'md'}>Add documents</Heading>
            <Box flexDirection="column" gap="md" alignItems="center">
                <Text size={'md'} align={'center'}>
                    Upload external documents such as policies or product
                    manuals to help your AI Agent provide more accurate answers.
                </Text>
                <Button variant="primary">Upload Document</Button>
            </Box>
        </Box>
    )
}

export const EmptyStateWrapper = ({
    documentFilter,
    helpCenterId,
    articles,
}: {
    documentFilter: KnowledgeType | null
    helpCenterId?: number | null
    articles: GroupedKnowledgeItem[]
}) => {
    switch (documentFilter) {
        case KnowledgeType.Document:
            return <EmptyStateDocument />
        case KnowledgeType.Domain:
            return <EmptyStateDomain />
        case KnowledgeType.FAQ:
            return (
                <EmptyStateFAQ
                    helpCenterId={helpCenterId}
                    articles={articles}
                />
            )
        case KnowledgeType.Guidance:
            return <EmptyStateGuidance />
        case KnowledgeType.URL:
            return <EmptyStateURL />
        default:
            return <EmptyStates />
    }
}
