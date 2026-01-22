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
import type { Opportunity } from 'pages/aiAgent/opportunities/types'

import css from './OpportunityGuidanceEditor.less'

export interface GuidanceFormFields {
    title: string
    body: string
    isVisible: boolean
}

interface OpportunityGuidanceEditorProps {
    opportunity: Opportunity
    isVisible?: boolean
    shopName: string
    onDelete?: () => void
    onValuesChange?: (fields: GuidanceFormFields) => void
    isInGuidanceEditorModeOnly?: boolean
}

export const OpportunityGuidanceEditor = ({
    opportunity,
    isVisible = true,
    shopName,
    onDelete,
    onValuesChange,
    isInGuidanceEditorModeOnly = false,
}: OpportunityGuidanceEditorProps) => {
    const { guidanceActions } = useGetGuidancesAvailableActions(
        shopName,
        'shopify',
    )

    const [formFields, setFormFields] = useState<GuidanceFormFields>({
        title: opportunity.title,
        body: opportunity.content,
        isVisible,
    })

    const handleFieldChange = (partialFields: Partial<GuidanceFormFields>) => {
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
                    content={formFields.body}
                    handleUpdateContent={(body) => handleFieldChange({ body })}
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
                                {formFields.isVisible ? 'Disable' : 'Enable'}
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
                        onClick={onDelete}
                        icon="trash-empty"
                    >
                        Delete
                    </Button>
                </Box>
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
