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
    TooltipTrigger,
} from '@gorgias/axiom'

import { GuidanceEditor } from 'pages/aiAgent/components/GuidanceEditor/GuidanceEditor'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import type {
    OpportunityResource,
    ResourceFormFields,
} from 'pages/aiAgent/opportunities/types'

import css from './OpportunityGuidanceEditor.less'

interface OpportunityGuidanceEditorProps {
    resource: OpportunityResource
    shopName: string
    onValuesChange?: (fields: ResourceFormFields) => void
    isInGuidanceEditorModeOnly?: boolean
}

export const OpportunityGuidanceEditor = ({
    resource,
    shopName,
    onValuesChange,
    isInGuidanceEditorModeOnly = false,
}: OpportunityGuidanceEditorProps) => {
    const { guidanceActions } = useGetGuidancesAvailableActions(
        shopName,
        'shopify',
    )

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

    const renderFormFields = () => (
        <Box flexDirection="column" gap="md">
            <div>
                <TextField
                    label="Guidance name"
                    value={formFields.title}
                    onChange={(value) => handleFieldChange({ title: value })}
                    isRequired
                    isDisabled={!formFields.isVisible}
                />
                <Text variant="regular" size="sm" className={css.caption}>
                    Use a short, scenario-based name. Example:{' '}
                    <Text variant="italic" size="sm">
                        Returns outside the policy window
                    </Text>
                </Text>
            </div>
            <div
                className={classNames(css.bodyField, {
                    [css.disabled]: !formFields.isVisible,
                    [css.editorModeOnly]: isInGuidanceEditorModeOnly,
                })}
            >
                <GuidanceEditor
                    content={formFields.content}
                    handleUpdateContent={(content) =>
                        handleFieldChange({ content })
                    }
                    label="Instructions"
                    shopName={shopName}
                    availableActions={guidanceActions}
                    showActionsButton
                    showDefaultToolbarActions={isInGuidanceEditorModeOnly}
                />
                <Text variant="regular" size="sm" className={css.caption}>
                    Describe the steps AI Agent should follow in clear, specific
                    phrases.
                </Text>
            </div>
        </Box>
    )

    if (isInGuidanceEditorModeOnly) {
        return renderFormFields()
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
                            [css.disabledTitle]: !formFields.isVisible,
                        })}
                    >
                        Guidance
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
                                >
                                    {formFields.isVisible
                                        ? 'Disable'
                                        : 'Enable'}
                                </Button>
                            </TooltipTrigger>
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
                    <div className={css.summary}>
                        <Text variant="bold" size="md">
                            {resource.insight}
                        </Text>
                    </div>
                )}
            </Box>

            <div
                className={classNames({
                    [css.disabled]: !formFields.isVisible,
                })}
            >
                {renderFormFields()}
            </div>
        </Box>
    )
}
