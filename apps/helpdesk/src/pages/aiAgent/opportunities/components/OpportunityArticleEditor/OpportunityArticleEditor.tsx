import { useState } from 'react'

import {
    Box,
    Button,
    Heading,
    TextField,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

import type { Opportunity } from 'pages/aiAgent/opportunities/types'
import TextArea from 'pages/common/forms/TextArea'

import css from './OpportunityArticleEditor.less'

export interface ArticleFormFields {
    title: string
    body: string
    isVisible: boolean
}

interface OpportunityArticleEditorProps {
    opportunity: Opportunity
    isVisible?: boolean
    onDelete?: () => void
    onValuesChange?: (fields: ArticleFormFields) => void
}

export const OpportunityArticleEditor = ({
    opportunity,
    isVisible = true,
    onDelete,
    onValuesChange,
}: OpportunityArticleEditorProps) => {
    const [formFields, setFormFields] = useState<ArticleFormFields>({
        title: opportunity.title,
        body: opportunity.content,
        isVisible,
    })

    const handleFieldChange = (partialFields: Partial<ArticleFormFields>) => {
        const updatedFields = {
            ...formFields,
            ...partialFields,
        }
        setFormFields(updatedFields)
        onValuesChange?.(updatedFields)
    }

    return (
        <Box flexDirection="column" gap="md" className={css.container}>
            <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                className={css.header}
            >
                <Heading
                    size="md"
                    className={
                        !formFields.isVisible ? css.disabledTitle : undefined
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
                                icon={formFields.isVisible ? 'hide' : 'show'}
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
                        onClick={onDelete}
                        icon="trash-empty"
                    >
                        Delete
                    </Button>
                </Box>
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
                    value={formFields.body}
                    onChange={(value) => handleFieldChange({ body: value })}
                    error={!formFields.body ? 'Body is required' : undefined}
                    isRequired
                    isDisabled={!formFields.isVisible}
                    className={css.bodyField}
                />
            </Box>
        </Box>
    )
}
