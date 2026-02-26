import type { ForwardedRef } from 'react'
import type React from 'react'
import { forwardRef, useImperativeHandle, useMemo, useState } from 'react'

import classNames from 'classnames'
import { Map } from 'immutable'
import { v4 as uuidv4 } from 'uuid'

import { LegacyButton as Button } from '@gorgias/axiom'

import type {
    GorgiasChatInstallationVisibility,
    GorgiasChatInstallationVisibilityCondition,
    GorgiasChatMetaInstallation,
} from 'models/integration/types'
import {
    GorgiasChatInstallationVisibilityConditionOperator,
    GorgiasChatInstallationVisibilityMatchConditions,
    GorgiasChatInstallationVisibilityMethod,
} from 'models/integration/types'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import Collapse from 'pages/common/components/Collapse/Collapse'
import SelectField from 'pages/common/forms/SelectField/SelectField'

import GorgiasChatIntegrationVisibilityCondition from './GorgiasChatIntegrationVisibilityCondition'
import type { UrlValidationResult } from './utils/validateUrl'
import validateUrl from './utils/validateUrl'

import css from './GorgiasChatIntegrationVisibilityControls.less'

const visibilityMethodCaptions: Record<
    GorgiasChatInstallationVisibilityMethod,
    string
> = {
    [GorgiasChatInstallationVisibilityMethod.ShowOnEveryPage]:
        'Show on every page',
    [GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages]:
        'Show on specific pages',
    [GorgiasChatInstallationVisibilityMethod.HideOnSpecificPages]:
        'Hide on specific pages',
}

const visibilityMethodCaptionsOptions = Object.entries(
    visibilityMethodCaptions,
).map(([value, label]) => ({ value, label }))

const matchConditionsCaptions: Record<
    GorgiasChatInstallationVisibilityMatchConditions,
    string
> = {
    [GorgiasChatInstallationVisibilityMatchConditions.Every]: 'All conditions',
    [GorgiasChatInstallationVisibilityMatchConditions.Some]:
        'At least one of the conditions',
}

const matchConditionsOptions = Object.entries(matchConditionsCaptions).map(
    ([value, label]) => ({ value, label }),
)

const makeCondition = () => ({
    id: uuidv4(),
    value: '',
    operator: GorgiasChatInstallationVisibilityConditionOperator.Contain,
})

export type GorgiasChatIntegrationVisibilityControlsHandle = {
    visibility: GorgiasChatInstallationVisibility
}

type Props = {
    integration: Map<any, any>
    open: () => void
    isOpen: boolean
    isUpdate: boolean
    canSubmit: boolean
    onSubmit: (visibility: GorgiasChatInstallationVisibility) => void
    onValidate: (isValid: boolean) => void
}

const GorgiasChatIntegrationVisibilityControls = (
    {
        integration,
        open,
        isOpen,
        isUpdate,
        canSubmit,
        onSubmit,
        onValidate,
    }: Props,
    ref: ForwardedRef<GorgiasChatIntegrationVisibilityControlsHandle>,
) => {
    const installationMeta = integration.getIn(
        ['meta', 'installation'],
        Map(),
    ) as Map<any, any>

    const installation: Maybe<GorgiasChatMetaInstallation> = installationMeta
        ? installationMeta.toJS()
        : undefined

    const initialVisibilityMethod =
        installation?.visibility?.method ||
        GorgiasChatInstallationVisibilityMethod.ShowOnEveryPage

    const [visibilityMethod, setVisibilityMethod] =
        useState<GorgiasChatInstallationVisibilityMethod>(
            initialVisibilityMethod,
        )

    const initialMatchConditions =
        installation?.visibility?.match_conditions ||
        GorgiasChatInstallationVisibilityMatchConditions.Some

    const [matchConditions, setMatchConditions] =
        useState<GorgiasChatInstallationVisibilityMatchConditions>(
            initialMatchConditions,
        )

    const [conditions, setConditions] = useState<
        (GorgiasChatInstallationVisibilityCondition & {
            validationResult?: UrlValidationResult
        })[]
    >(installation?.visibility?.conditions || [makeCondition()])

    const [hasValidationError, setHasValidationError] = useState(false)

    const visibility: GorgiasChatInstallationVisibility = useMemo(() => {
        if (conditions.every(({ value }) => !value)) {
            return {
                method: GorgiasChatInstallationVisibilityMethod.ShowOnEveryPage,
            }
        }

        return {
            method: visibilityMethod,
            ...(visibilityMethod !==
            GorgiasChatInstallationVisibilityMethod.ShowOnEveryPage
                ? {
                      match_conditions: matchConditions,
                      conditions: conditions.filter(({ value }) => !!value),
                  }
                : undefined),
        }
    }, [visibilityMethod, matchConditions, conditions])

    useImperativeHandle(ref, () => ({ visibility }), [visibility])

    const updateCondition = (
        index: number,
        values: Partial<GorgiasChatInstallationVisibilityCondition>,
    ) => {
        const newConditions = [...conditions]
        newConditions[index] = {
            ...newConditions[index],
            ...values,
            validationResult: validateUrl(
                values.value ?? newConditions[index].value,
                values.operator ?? newConditions[index].operator,
            ),
        }

        const hasValidationError = newConditions.some(
            ({ validationResult }) =>
                validationResult && validationResult !== 'valid',
        )

        setHasValidationError(hasValidationError)

        onValidate(!hasValidationError)

        setConditions(newConditions)
    }

    const addCondition = () => {
        setConditions([...conditions, makeCondition()])
    }

    const deleteCondition = (index: number) => {
        setConditions(conditions.filter((_, i) => i !== index))
    }

    const hasIncompatibleConditions =
        matchConditions ===
            GorgiasChatInstallationVisibilityMatchConditions.Every &&
        conditions.filter(
            ({ operator }) =>
                operator ===
                GorgiasChatInstallationVisibilityConditionOperator.Equal,
        ).length > 1

    const isDirty =
        visibilityMethod !== initialVisibilityMethod ||
        matchConditions !== initialMatchConditions ||
        conditions.length !== installation?.visibility?.conditions?.length ||
        conditions.some(
            (condition, index) =>
                condition.value !==
                    installation?.visibility?.conditions?.[index].value ||
                condition.operator !==
                    installation?.visibility?.conditions?.[index].operator,
        )

    const isShowOnEveryPage =
        visibilityMethod ===
        GorgiasChatInstallationVisibilityMethod.ShowOnEveryPage

    const hideUpdateInstallationButton =
        isShowOnEveryPage &&
        initialVisibilityMethod ===
            GorgiasChatInstallationVisibilityMethod.ShowOnEveryPage

    return (
        <div
            className={classNames({
                [css.disabled]: !isUpdate,
            })}
        >
            <div
                className={classNames(css.visibilityMethodDropdownPlaceholder, {
                    [css.hide]: isOpen,
                })}
            >
                <span>{visibilityMethodCaptions[initialVisibilityMethod]}</span>
                <span className={css.visibilityMethodDropdownPlaceholderIcon}>
                    <i className="material-icons" onClick={open}>
                        edit
                    </i>
                </span>
            </div>
            <Collapse isOpen={isOpen}>
                <SelectField
                    value={visibilityMethod}
                    onChange={
                        setVisibilityMethod as React.ComponentProps<
                            typeof SelectField
                        >['onChange']
                    }
                    options={visibilityMethodCaptionsOptions}
                />
                {!isShowOnEveryPage && (
                    <div className={css.visibilityControls}>
                        <div className={css.matchConditions}>
                            <span>
                                {visibilityMethod ===
                                GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages
                                    ? 'Show'
                                    : 'Hide'}{' '}
                                on pages that match
                            </span>
                            <SelectField
                                className={css.matchConditionsDropdown}
                                value={matchConditions}
                                onChange={
                                    setMatchConditions as React.ComponentProps<
                                        typeof SelectField
                                    >['onChange']
                                }
                                options={matchConditionsOptions}
                            />
                        </div>
                        <div className={css.conditions}>
                            {conditions.map(
                                (
                                    { id, value, operator, validationResult },
                                    index,
                                ) => (
                                    <GorgiasChatIntegrationVisibilityCondition
                                        key={id}
                                        value={value}
                                        operator={operator}
                                        onChange={(
                                            values: Partial<GorgiasChatInstallationVisibilityCondition>,
                                        ) => updateCondition(index, values)}
                                        onDelete={() => deleteCondition(index)}
                                        validationResult={
                                            !!value
                                                ? validationResult
                                                : undefined
                                        }
                                        isDeletable={conditions.length > 1}
                                    />
                                ),
                            )}
                        </div>
                        {hasIncompatibleConditions && (
                            <Alert
                                icon="report_problem"
                                type={AlertType.Warning}
                            >
                                {`The selected conditions are incompatible. To
                                make sure the chat is displayed correctly,
                                select "At least one condition" filter or remove
                                a condition.`}
                            </Alert>
                        )}
                    </div>
                )}
                <div className={css.footer}>
                    {!isShowOnEveryPage && (
                        <Button
                            fillStyle="ghost"
                            onClick={addCondition}
                            leadingIcon="add"
                        >
                            Add URL
                        </Button>
                    )}
                    {isUpdate && !hideUpdateInstallationButton && (
                        <Button
                            onClick={() => onSubmit(visibility)}
                            isDisabled={
                                !isDirty ||
                                hasValidationError ||
                                hasIncompatibleConditions ||
                                !canSubmit
                            }
                        >
                            Update installation
                        </Button>
                    )}
                </div>
            </Collapse>
        </div>
    )
}

export default forwardRef<
    GorgiasChatIntegrationVisibilityControlsHandle,
    Props
>(GorgiasChatIntegrationVisibilityControls)
