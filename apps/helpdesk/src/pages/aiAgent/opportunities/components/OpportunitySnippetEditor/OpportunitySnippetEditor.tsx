import { useState } from 'react'

import classNames from 'classnames'

import {
    Box,
    Button,
    Heading,
    Icon,
    Text,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

import type { Opportunity } from 'pages/aiAgent/opportunities/types'

import css from './OpportunitySnippetEditor.less'

export interface SnippetFormFields {
    isVisible: boolean
}

interface OpportunitySnippetEditorProps {
    opportunity: Opportunity
    source: string
    isVisible?: boolean
    onValuesChange?: (fields: SnippetFormFields) => void
}

export const OpportunitySnippetEditor = ({
    opportunity,
    isVisible = true,
    onValuesChange,
    source,
}: OpportunitySnippetEditorProps) => {
    const [formFields, setFormFields] = useState<SnippetFormFields>({
        isVisible,
    })

    const handleFieldChange = (partialFields: Partial<SnippetFormFields>) => {
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

    // TODO: Implement source click
    const handleSourceClick = () => {
        return null
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
                    className={!formFields.isVisible ? css.disabled : undefined}
                >
                    Snippet
                </Heading>
                <Tooltip>
                    <TooltipTrigger>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleDisableClick}
                        >
                            {formFields.isVisible ? 'Disable' : 'Enable'}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {formFields.isVisible
                            ? 'Disable knowledge for AI Agent'
                            : 'Enable knowledge for AI Agent'}
                    </TooltipContent>
                </Tooltip>
            </Box>

            <Box
                flexDirection="column"
                gap="md"
                padding="md"
                className={classNames(css.bodyContainer, {
                    [css.disabled]: !formFields.isVisible,
                })}
            >
                <div
                    className={css.sourceContainer}
                    onClick={handleSourceClick}
                >
                    <Icon
                        name="nav-globe"
                        color="var(--content-accent-default)"
                    />
                    <Text size="sm" variant="regular">
                        {source}
                    </Text>
                </div>
                <Box flexDirection="column" gap="xxxs">
                    <Text size="md" variant="bold">
                        {opportunity.title}
                    </Text>
                    <Text size="md" variant="regular">
                        {opportunity.content}
                    </Text>
                </Box>
            </Box>
        </Box>
    )
}
