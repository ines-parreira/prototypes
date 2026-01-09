import { Box, Button, Card, Heading, Icon, Text } from '@gorgias/axiom'

import {
    HELP_CENTER_SELECT_MODAL_OPEN,
    OPEN_CREATE_GUIDANCE_ARTICLE_MODAL,
    OPEN_SYNC_WEBSITE_MODAL,
} from 'pages/aiAgent/KnowledgeHub/constants'
import { openSyncUrlModal } from 'pages/aiAgent/KnowledgeHub/EmptyState/SyncUrlModal'
import {
    dispatchDocumentEvent,
    openSyncStoreWebsiteModal,
} from 'pages/aiAgent/KnowledgeHub/EmptyState/utils'
import type { GroupedKnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'
import { KnowledgeType, typeConfig } from 'pages/aiAgent/KnowledgeHub/types'

import { ClearSearchButton } from '../Table/BulkActions/ClearSearchButton'
import { openUploadDocumentModal } from './UploadDocumentModal'

import css from './EmptyState.less'

export const EmptyStates = ({
    hasWebsiteSync = false,
    titleAlignment = 'center',
    helpCenterId,
    onFaqEditorOpen,
}: {
    hasWebsiteSync?: boolean
    titleAlignment?: string
    helpCenterId?: number | null
    onFaqEditorOpen?: () => void
}) => {
    return (
        <Box flexDirection="column" gap="xl">
            {/* Top row*/}
            <Box
                flexDirection={'column'}
                gap="md"
                alignItems={titleAlignment}
                width="100%"
            >
                <Heading size={'sm'}>Create new content</Heading>
                <Box flexDirection={'row'} gap="md">
                    <Card
                        elevation="default"
                        onClick={() => {
                            dispatchDocumentEvent(
                                OPEN_CREATE_GUIDANCE_ARTICLE_MODAL,
                            )
                        }}
                        gap="xs"
                    >
                        <div className={css.cardTitle}>
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
                        </div>
                        <Text
                            size={'sm'}
                            as="p"
                            className={css.cardDescription}
                        >
                            Instruct AI Agent to handle customer requests and
                            follow internal processes.
                        </Text>
                    </Card>
                    <Card
                        onClick={() => {
                            if (!helpCenterId) {
                                dispatchDocumentEvent(
                                    HELP_CENTER_SELECT_MODAL_OPEN,
                                )
                            } else {
                                onFaqEditorOpen?.()
                            }
                        }}
                        gap="xs"
                    >
                        <div className={css.cardTitle}>
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
                        </div>
                        <Text
                            size={'sm'}
                            as="p"
                            className={css.cardDescription}
                        >
                            Let AI Agent use published Help Center articles as
                            knowledge.
                        </Text>
                    </Card>
                </Box>
            </Box>
            {/* Bottom row*/}
            <Box flexDirection={'column'} gap="md" width="100%">
                <Heading size={'sm'}>Sync or upload external content</Heading>
                <Box flexDirection={'row'} gap="md">
                    {!hasWebsiteSync && (
                        <Card
                            onClick={() => {
                                openSyncStoreWebsiteModal()
                            }}
                            gap="xs"
                        >
                            <div className={css.cardTitle}>
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
                            </div>
                            <Text
                                size={'sm'}
                                as="p"
                                className={css.cardDescription}
                            >
                                Sync your site content
                            </Text>
                        </Card>
                    )}

                    <Card
                        onClick={() => {
                            openSyncUrlModal()
                        }}
                        gap="xs"
                    >
                        <div className={css.cardTitle}>
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
                        </div>
                        <Text
                            size={'sm'}
                            as="p"
                            className={css.cardDescription}
                        >
                            Sync single-page URLs
                        </Text>
                    </Card>
                    <Card
                        onClick={() => {
                            openUploadDocumentModal()
                        }}
                        gap="xs"
                    >
                        <div className={css.cardTitle}>
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
                        </div>
                        <Text
                            size={'sm'}
                            as="p"
                            className={css.cardDescription}
                        >
                            Upload external files
                        </Text>
                    </Card>
                </Box>
            </Box>
        </Box>
    )
}

export const EmptyStateGuidance = () => {
    const toggleModal = () => {
        dispatchDocumentEvent(OPEN_CREATE_GUIDANCE_ARTICLE_MODAL)
    }

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
                <Button variant="primary" onClick={toggleModal}>
                    Create Guidance
                </Button>
            </Box>
        </Box>
    )
}

export const EmptyStateFAQ = ({
    helpCenterId,
    articles,
    onFaqEditorOpen,
}: {
    helpCenterId?: number | null
    articles: GroupedKnowledgeItem[]
    onFaqEditorOpen?: () => void
}) => {
    const openSelectModal = () => {
        dispatchDocumentEvent(HELP_CENTER_SELECT_MODAL_OPEN)
    }

    const openEditor = () => {
        onFaqEditorOpen?.()
    }
    const EMPTY_STATE_CONTENT = {
        noHelpCenter: {
            title: 'Connect your Help Center',
            description:
                'Let AI Agent use your published Help Center articles as knowledge.',
            buttonText: 'Connect Help Center',
            action: openSelectModal,
        },
        helpCenterWithoutArticles: {
            title: 'Get started with Help Center articles',
            description:
                'Let AI Agent use your published Help Center articles as knowledge.',
            buttonText: 'Create Help Center article',
            action: openEditor,
        },
        helpCenterWithArticles: {
            title: 'Get started with Help Center articles',
            description:
                'Create and publish articles to make them available to AI Agent.',
            buttonText: 'Create Help Center article',
            action: openEditor,
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
                <Button variant="primary" onClick={content.action}>
                    {content.buttonText}
                </Button>
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
                <Button
                    variant="primary"
                    leadingSlot="arrows-reload-alt-1"
                    onClick={() => {
                        dispatchDocumentEvent(OPEN_SYNC_WEBSITE_MODAL)
                    }}
                >
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
                    Add links to public pages AI Agent can learn from like blog
                    posts or external documentation.
                </Text>
                <Button
                    variant="primary"
                    onClick={() => {
                        openSyncUrlModal()
                    }}
                >
                    Add URL
                </Button>
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
                <Button
                    variant="primary"
                    onClick={() => {
                        openUploadDocumentModal()
                    }}
                >
                    Upload Document
                </Button>
            </Box>
        </Box>
    )
}

export const EmptyStateWrapper = ({
    documentFilter,
    helpCenterId,
    articles,
    onFaqEditorOpen,
}: {
    documentFilter: KnowledgeType | null
    helpCenterId?: number | null
    articles: GroupedKnowledgeItem[]
    onFaqEditorOpen?: () => void
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
                    onFaqEditorOpen={onFaqEditorOpen}
                />
            )
        case KnowledgeType.Guidance:
            return <EmptyStateGuidance />
        case KnowledgeType.URL:
            return <EmptyStateURL />
        default:
            return (
                <EmptyStates
                    helpCenterId={helpCenterId}
                    onFaqEditorOpen={onFaqEditorOpen}
                />
            )
    }
}

export const EmptyStateNoSearchResults = ({
    clearSearch,
}: {
    clearSearch: () => void
}) => {
    return (
        <Box
            flexDirection="column"
            gap="xs"
            alignItems="center"
            justifyContent="center"
            padding="xxxl"
        >
            <Heading size={'md'}>No results found</Heading>
            <Box flexDirection="column" gap="md" alignItems="center">
                <Text size={'md'} align={'center'}>
                    Try adjusting your search or filters to find the right
                    knowledge.
                </Text>
                <ClearSearchButton onClick={clearSearch} size="md" />
            </Box>
        </Box>
    )
}
