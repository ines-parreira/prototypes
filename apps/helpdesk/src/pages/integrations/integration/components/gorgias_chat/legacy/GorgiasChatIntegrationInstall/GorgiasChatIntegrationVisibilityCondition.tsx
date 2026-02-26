import type React from 'react'
import { useRef } from 'react'

import classNames from 'classnames'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import type { GorgiasChatInstallationVisibilityCondition } from 'models/integration/types'
import { GorgiasChatInstallationVisibilityConditionOperator } from 'models/integration/types'
import IconButton from 'pages/common/components/button/IconButton'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import InputField from 'pages/common/forms/input/InputField'
import SelectField from 'pages/common/forms/SelectField/SelectField'

import type { UrlValidationResult } from './utils/validateUrl'

import css from './GorgiasChatIntegrationVisibilityCondition.less'

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
).map(([value, label]) => ({ value, label }))

const errorByUrlValidationResult: Record<
    Exclude<UrlValidationResult, 'valid'>,
    React.ReactNode
> = {
    invalid: <>That URL doesn’t exist. Check your spelling and try again.</>,
    unsupported: (
        <>
            <span>That URL is not supported.</span>
            <IconTooltip className={css.helpIcon} icon="help_outline">
                {`Hash mark separators (e.g. "#example") in URLs are not
                supported.`}
            </IconTooltip>
        </>
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

const GorgiasChatIntegrationVisibilityCondition: React.FC<Props> = ({
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
            <Button className={css.pageUrlButton} intent="secondary">
                Page URL
            </Button>
            <SelectField
                value={operator}
                onChange={(operator) =>
                    onChange({
                        operator:
                            operator as GorgiasChatInstallationVisibilityConditionOperator,
                    })
                }
                options={visibilityConditionOperatorCaptionsOptions}
            />
            <InputField
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
            />
            <IconButton
                className={classNames({
                    [css.deleteButtonDisabled]: !isDeletable,
                })}
                intent={isDeletable ? 'destructive' : 'secondary'}
                fillStyle="ghost"
                onClick={onDelete}
                ref={deleteButtonRef}
                isDisabled={!isDeletable}
            >
                close
            </IconButton>
            {!isDeletable && (
                <Tooltip
                    className={css.deleteButtonTooltip}
                    placement="top"
                    target={deleteButtonRef}
                >
                    At least one condition is required to show or hide the chat
                    on specific pages.
                </Tooltip>
            )}
        </div>
    )
}

export default GorgiasChatIntegrationVisibilityCondition
