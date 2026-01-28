import { useState } from 'react'

import {
    Box,
    Button,
    Heading,
    Text,
    TextField,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

import type {
    OpportunityResource,
    ResourceFormFields,
} from 'pages/aiAgent/opportunities/types'
import TextArea from 'pages/common/forms/TextArea'

import css from './OpportunityArticleEditor.less'

interface OpportunityArticleEditorProps {
    resource: OpportunityResource
    onValuesChange?: (fields: ResourceFormFields) => void
}

export const OpportunityArticleEditor = ({
    resource,
    onValuesChange,
}: OpportunityArticleEditorProps) => {
    const [formFields, setFormFields] = useState<ResourceFormFields>({
        title: resource.title,
        content: resource.content,
        isVisible: resource.isVisible,
        isDeleted: false,
    })

    const handleFieldChange = (partialFields: Partial<ResourceFormFields>) => {
        const updatedFields = {
            ...formFields,
            ...partialFields,
        }
        setFormFields(updatedFields)
        onValuesChange?.(updatedFields)
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
                            !formFields.isVisible
                                ? css.disabledTitle
                                : undefined
                        }
                    >
                        Help Center article
                    </Heading>
                    <Box flexDirection="row" gap="xs">
                        <Tooltip>
                            <TooltipTrigger>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                        handleFieldChange({
                                            isVisible: !formFields.isVisible,
                                        })
                                    }
                                    icon={
                                        formFields.isVisible ? 'hide' : 'show'
                                    }
                                >
                                    {' '}
                                    {formFields.isVisible ? 'Hide' : 'Show'}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Make article private to hide it from your Help
                                Center and disable it for AI Agent.
                            </TooltipContent>
                        </Tooltip>
                        <Button
                            size="sm"
                            variant="secondary"
                            intent="destructive"
                            onClick={() =>
                                handleFieldChange({ isDeleted: true })
                            }
                            icon="trash-empty"
                        >
                            Delete
                        </Button>
                    </Box>
                </Box>

                {resource.insight && (
                    <div className={css.summary}>
                        <Text variant="bold" size="md">
                            {resource.insight}
                        </Text>
                    </div>
                )}
            </Box>
            <Box flexDirection="column" gap="md" className={css.body}>
                <TextField
                    label="Title"
                    value={formFields.title}
                    onChange={(value) => handleFieldChange({ title: value })}
                    error={!formFields.title ? 'Title is required' : undefined}
                    isInvalid={!formFields.title}
                    isRequired
                    isDisabled={!formFields.isVisible}
                />
                <TextArea
                    autoRowHeight
                    label="Body"
                    value={formFields.content}
                    onChange={(value) => handleFieldChange({ content: value })}
                    error={!formFields.content ? 'Body is required' : undefined}
                    isRequired
                    isDisabled={!formFields.isVisible}
                    className={css.bodyField}
                />
            </Box>
        </Box>
    )
}
