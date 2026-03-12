import { useState } from 'react'

import classNames from 'classnames'
import { useHistory } from 'react-router'

import {
    Box,
    Button,
    Heading,
    Icon,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import type {
    OpportunityResource,
    ResourceFormFields,
} from 'pages/aiAgent/opportunities/types'

import css from './OpportunitySnippetEditor.less'

interface OpportunitySnippetEditorProps {
    resource: OpportunityResource
    shopName: string
    onValuesChange?: (fields: ResourceFormFields) => void
}

export const OpportunitySnippetEditor = ({
    resource,
    shopName,
    onValuesChange,
}: OpportunitySnippetEditorProps) => {
    const history = useHistory()
    const { routes } = useAiAgentNavigation({ shopName })

    const [formFields, setFormFields] = useState<ResourceFormFields>({
        title: resource.title,
        content: resource.content,
        isVisible: resource.isVisible,
    })

    const handleFieldChange = (partialFields: Partial<ResourceFormFields>) => {
        const updatedFields = {
            ...formFields,
            ...partialFields,
        }
        setFormFields(updatedFields)
        onValuesChange?.(updatedFields)
    }

    const handleDisableClick = () => {
        handleFieldChange({ isVisible: !formFields.isVisible })
    }

    const handleSourceClick = () => {
        const source = resource.meta?.articleIngestionLog?.source
        const sourceName = resource.meta?.articleIngestionLog?.source_name
        const resourceId = resource.identifiers?.resourceId

        if (!source || !sourceName || !resourceId) return

        let sourceType: string

        switch (source) {
            case 'file':
                sourceType = 'document'
                break
            case 'domain':
                sourceType = 'domain'
                break
            case 'url':
                sourceType = 'url'
                break
            default:
                return
        }

        const folderParam = encodeURIComponent(sourceName)
        const knowledgeHubUrl = `${routes.knowledge}/${sourceType}/${resourceId}?filter=${sourceType}&folder=${folderParam}`
        history.push(knowledgeHubUrl)
    }

    return (
        <Box flexDirection="column" gap="md" className={css.container}>
            <Box flexDirection="column" gap="sm">
                <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    className={css.header}
                >
                    <Heading
                        size="md"
                        className={
                            !formFields.isVisible ? css.disabled : undefined
                        }
                    >
                        Snippet
                    </Heading>
                    <Tooltip
                        trigger={
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={handleDisableClick}
                            >
                                {formFields.isVisible ? 'Disable' : 'Enable'}
                            </Button>
                        }
                    >
                        <TooltipContent>
                            {formFields.isVisible
                                ? 'Disable knowledge for AI Agent'
                                : 'Enable knowledge for AI Agent'}
                        </TooltipContent>
                    </Tooltip>
                </Box>

                {resource.insight && (
                    <div
                        className={classNames(css.summary, {
                            [css.disabled]: !formFields.isVisible,
                        })}
                    >
                        <Text variant="regular" size="md">
                            {resource.insight}
                        </Text>
                    </div>
                )}
            </Box>

            <Box
                flexDirection="column"
                gap="md"
                padding="md"
                className={classNames(css.bodyContainer, {
                    [css.disabled]: !formFields.isVisible,
                })}
            >
                {resource.meta?.articleIngestionLog?.source_name && (
                    <div
                        className={css.sourceContainer}
                        onClick={handleSourceClick}
                    >
                        <Icon
                            name="nav-globe"
                            color="var(--content-accent-default)"
                        />
                        <Text size="sm" variant="regular">
                            {resource.meta?.articleIngestionLog?.source_name}
                        </Text>
                    </div>
                )}
                <Box flexDirection="column" gap="xxxs">
                    <Text size="md" variant="bold">
                        {resource.title}
                    </Text>
                    <Text size="md" variant="regular">
                        {resource.content}
                    </Text>
                </Box>
            </Box>
        </Box>
    )
}
