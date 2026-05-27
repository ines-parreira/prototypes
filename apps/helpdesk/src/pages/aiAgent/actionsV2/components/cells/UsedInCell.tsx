import { useState } from 'react'

import { useHistory } from 'react-router-dom'

import {
    Box,
    Button,
    Link,
    Popover,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { useGuidanceReferenceContext } from 'pages/aiAgent/actions/providers/GuidanceReferenceContext'
import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

type Props = {
    action: StoreWorkflowsConfiguration
    shopName: string
}

const MAX_TITLE_LENGTH = 15

const truncate = (text: string) =>
    text.length > MAX_TITLE_LENGTH
        ? `${text.slice(0, MAX_TITLE_LENGTH)}...`
        : text

const UsedInCell = ({ action, shopName }: Props) => {
    const history = useHistory()
    const { routes } = useAiAgentNavigation({ shopName })
    const { references } = useGuidanceReferenceContext()
    const [isOverflowOpen, setIsOverflowOpen] = useState(false)
    const linkedReferences = references[action.id] ?? []

    const goToReference = (sourceId: string) => {
        const id = parseInt(sourceId, 10)
        if (Number.isNaN(id)) {
            history.push(routes.skills)
            return
        }
        history.push(routes.knowledgeArticle('guidance', id))
    }

    if (linkedReferences.length === 0) {
        return (
            <Box
                display="inline-flex"
                onClick={(event) => event.stopPropagation()}
            >
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={(event) => {
                        event.stopPropagation()
                        history.push(routes.skills)
                    }}
                >
                    Link
                </Button>
            </Box>
        )
    }

    const [first, ...rest] = linkedReferences

    return (
        <Box
            display="flex"
            alignItems="center"
            gap="xxxs"
            flexWrap="nowrap"
            maxWidth="100%"
            overflow="hidden"
            onClick={(event) => event.stopPropagation()}
        >
            <Tooltip
                trigger={
                    <Box display="inline-flex" flexShrink={0}>
                        <Link
                            onClick={(event) => {
                                event.stopPropagation()
                                goToReference(first.sourceId)
                            }}
                        >
                            {truncate(first.title)}
                        </Link>
                    </Box>
                }
            >
                <TooltipContent caption={first.title} />
            </Tooltip>
            {rest.length > 0 && (
                <Popover
                    isOpen={isOverflowOpen}
                    onOpenChange={setIsOverflowOpen}
                    placement="bottom left"
                    padding="sm"
                    trigger={
                        <Button
                            size="sm"
                            variant="tertiary"
                            aria-label={`Show ${rest.length} more references`}
                            onClick={(event) => event.stopPropagation()}
                        >
                            +{rest.length}
                        </Button>
                    }
                >
                    <Box
                        flexDirection="column"
                        gap="xs"
                        alignItems="flex-start"
                    >
                        {rest.map((reference) => (
                            <Link
                                key={reference.id}
                                onClick={(event) => {
                                    event.stopPropagation()
                                    setIsOverflowOpen(false)
                                    goToReference(reference.sourceId)
                                }}
                            >
                                <Text as="span">{reference.title}</Text>
                            </Link>
                        ))}
                    </Box>
                </Popover>
            )}
        </Box>
    )
}

export default UsedInCell
