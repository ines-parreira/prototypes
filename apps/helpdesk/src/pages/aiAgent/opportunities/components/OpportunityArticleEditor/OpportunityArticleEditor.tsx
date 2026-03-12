import { useState } from 'react'

import classNames from 'classnames'

import {
    Box,
    Button,
    Heading,
    Text,
    TextField,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { GuidanceEditor } from 'pages/aiAgent/components/GuidanceEditor/GuidanceEditor'
import type {
    OpportunityResource,
    ResourceFormFields,
} from 'pages/aiAgent/opportunities/types'

import css from './OpportunityArticleEditor.less'

interface OpportunityArticleEditorProps {
    resource: OpportunityResource
    shopName: string
    onValuesChange?: (fields: ResourceFormFields) => void
}

export const OpportunityArticleEditor = ({
    resource,
    shopName,
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
                        className={classNames({
                            [css.disabled]: !formFields.isVisible,
                        })}
                    >
                        Help Center article
                    </Heading>
                    <Box flexDirection="row" gap="xs">
                        <Tooltip
                            trigger={
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                        handleFieldChange({
                                            isVisible: !formFields.isVisible,
                                        })
                                    }
                                >
                                    {formFields.isVisible
                                        ? 'Disable'
                                        : 'Enable'}
                                </Button>
                            }
                        >
                            <TooltipContent>
                                {formFields.isVisible
                                    ? 'Disable knowledge for AI Agent'
                                    : 'Enable knowledge for AI Agent'}
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
            <Box flexDirection="column" gap="md" className={css.body}>
                <div className={css.titleField}>
                    <TextField
                        label="Title"
                        value={formFields.title}
                        onChange={(value) =>
                            handleFieldChange({ title: value })
                        }
                        error={
                            !formFields.title ? 'Title is required' : undefined
                        }
                        isInvalid={!formFields.title}
                        isRequired
                        isDisabled={!formFields.isVisible}
                    />
                </div>

                <div
                    className={classNames(css.articleBodyField, {
                        [css.disabled]: !formFields.isVisible,
                    })}
                >
                    <GuidanceEditor
                        content={formFields.content}
                        handleUpdateContent={(content) =>
                            handleFieldChange({ content })
                        }
                        label="Body"
                        availableActions={[]}
                        showActionsButton={false}
                        showVariablesButton={false}
                        shopName={shopName}
                    />
                </div>
            </Box>
        </Box>
    )
}
