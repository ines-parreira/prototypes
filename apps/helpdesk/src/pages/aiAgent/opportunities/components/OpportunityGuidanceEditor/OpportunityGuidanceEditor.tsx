import { useState } from 'react'

import classNames from 'classnames'

import {
    Banner,
    Box,
    Button,
    Heading,
    Icon,
    Text,
    TextField,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

import { GuidanceEditor } from 'pages/aiAgent/components/GuidanceEditor/GuidanceEditor'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
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

interface FormFieldsComponentProps {
    formFields: ResourceFormFields
    handleFieldChange: (partialFields: Partial<ResourceFormFields>) => void
    shopName: string
    guidanceActions: ReturnType<
        typeof useGetGuidancesAvailableActions
    >['guidanceActions']
    isInGuidanceEditorModeOnly: boolean
}

const FormFieldsComponent = ({
    formFields,
    handleFieldChange,
    shopName,
    guidanceActions,
    isInGuidanceEditorModeOnly,
}: FormFieldsComponentProps) => (
    <Box flexDirection="column" gap="md">
        <div className={css.titleField}>
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
                    When customers request a return
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
            />
            <Text variant="regular" size="sm" className={css.caption}>
                Describe the steps AI Agent should follow in clear, specific
                phrases.
            </Text>
        </div>
    </Box>
)

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
    const { routes } = useAiAgentNavigation({ shopName })

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

    const renderKnowledgeGapView = () => (
        <Banner intent="info" isClosable={false}>
            <Box flexDirection="row" gap="xs" alignItems="flex-start">
                <Icon
                    name="ai-agent-feedback"
                    size="md"
                    color="var(--content-accent-default)"
                />
                <Box
                    flexDirection="column"
                    gap="xs"
                    alignItems="flex-start"
                    width="100%"
                >
                    <Text variant="bold" size="md">
                        Summary
                    </Text>
                    <Text variant="regular" size="md">
                        {resource.insight}
                    </Text>
                    <Button
                        as="a"
                        href={`${routes.knowledge}/sources?filter=guidance`}
                        target="_blank"
                        variant="secondary"
                        trailingSlot="external-link"
                        size="sm"
                    >
                        Go to Guidance
                    </Button>
                </Box>
            </Box>
        </Banner>
    )

    if (isInGuidanceEditorModeOnly) {
        return renderKnowledgeGapView()
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

            <div
                className={classNames({
                    [css.disabled]: !formFields.isVisible,
                })}
            >
                <FormFieldsComponent
                    formFields={formFields}
                    handleFieldChange={handleFieldChange}
                    shopName={shopName}
                    guidanceActions={guidanceActions}
                    isInGuidanceEditorModeOnly={isInGuidanceEditorModeOnly}
                />
            </div>
        </Box>
    )
}
