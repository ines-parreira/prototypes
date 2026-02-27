import type React from 'react'
import { useRef } from 'react'

import {
    Button,
    ButtonIntent,
    ButtonVariant,
    Icon,
    IconName,
    ListItem,
    SelectField,
    TextField,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

import type { GorgiasChatInstallationVisibilityCondition } from 'models/integration/types'
import { GorgiasChatInstallationVisibilityConditionOperator } from 'models/integration/types'
import type { UrlValidationResult } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationInstall/utils/validateUrl'

import css from './VisibilityCondition.less'

const visibilityConditionOperatorCaptions: Record<
    GorgiasChatInstallationVisibilityConditionOperator,
    string
> = {
    [GorgiasChatInstallationVisibilityConditionOperator.Contain]: 'contains',
    [GorgiasChatInstallationVisibilityConditionOperator.NotContain]:
        'does not contain',
    [GorgiasChatInstallationVisibilityConditionOperator.Equal]: 'is',
    [GorgiasChatInstallationVisibilityConditionOperator.NotEqual]: 'is not',
}

const visibilityConditionOperatorCaptionsOptions = Object.entries(
    visibilityConditionOperatorCaptions,
).map(([value, label]) => ({ value, label, id: value }))

const errorByUrlValidationResult: Record<
    Exclude<UrlValidationResult, 'valid'>,
    React.ReactNode
> = {
    invalid: (
        <>That URL doesn&rsquo;t exist. Check your spelling and try again.</>
    ),
    unsupported: (
        <span className={css.unsupportedError}>
            That URL is not supported.
            <Tooltip delay={100}>
                <TooltipTrigger>
                    <Icon name={IconName.CircleHelp} />
                </TooltipTrigger>
                <TooltipContent>
                    Hash mark separators (e.g. &quot;#example&quot;) in URLs are
                    notsupported.
                </TooltipContent>
            </Tooltip>
        </span>
    ),
}

type Props = {
    value: string
    operator: GorgiasChatInstallationVisibilityConditionOperator
    onChange: (
        values: Partial<GorgiasChatInstallationVisibilityCondition>,
    ) => void
    onDelete: () => void
    isDeletable?: boolean
    validationResult?: UrlValidationResult
}

const VisibilityCondition: React.FC<Props> = ({
    value,
    operator,
    onChange,
    onDelete,
    isDeletable,
    validationResult,
}) => {
    const deleteButtonRef = useRef<HTMLButtonElement>(null)

    return (
        <div className={css.condition}>
            <div className={css.pageUrlButton}>
                <Button
                    variant={ButtonVariant.Secondary}
                    intent={ButtonIntent.Regular}
                >
                    Page URL
                </Button>
            </div>
            <SelectField
                items={visibilityConditionOperatorCaptionsOptions}
                value={visibilityConditionOperatorCaptionsOptions.find(
                    (opt) => opt.value === operator,
                )}
                onChange={(option: any) =>
                    onChange({
                        operator:
                            option.value as GorgiasChatInstallationVisibilityConditionOperator,
                    })
                }
            >
                {(option: any) => <ListItem label={option.label} />}
            </SelectField>
            <TextField
                className={css.textInput}
                value={value}
                error={
                    validationResult && validationResult !== 'valid'
                        ? errorByUrlValidationResult[validationResult]
                        : undefined
                }
                onChange={(value) =>
                    onChange({
                        value,
                    })
                }
            ></TextField>

            <Tooltip placement="top" isDisabled={isDeletable} delay={100}>
                <TooltipTrigger>
                    <Button
                        isDisabled={!isDeletable}
                        icon={IconName.Close}
                        intent={
                            isDeletable
                                ? ButtonIntent.Destructive
                                : ButtonIntent.Regular
                        }
                        variant={ButtonVariant.Tertiary}
                        ref={deleteButtonRef}
                        onClick={onDelete}
                    ></Button>
                </TooltipTrigger>
                <TooltipContent>
                    At least one condition is required to show or hide the chat
                    on specific pages.
                </TooltipContent>
            </Tooltip>
        </div>
    )
}

export default VisibilityCondition
