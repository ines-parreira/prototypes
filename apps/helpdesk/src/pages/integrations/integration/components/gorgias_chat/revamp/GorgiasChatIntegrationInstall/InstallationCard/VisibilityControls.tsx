import type { ForwardedRef } from 'react'
import { forwardRef, useCallback, useEffect, useImperativeHandle } from 'react'

import classNames from 'classnames'
import { Map } from 'immutable'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'

import {
    Banner,
    Button,
    ButtonIntent,
    ButtonVariant,
    Icon,
    IconName,
    ListItem,
    SelectField,
} from '@gorgias/axiom'

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
import Collapse from 'pages/common/components/Collapse/Collapse'
import type { UrlValidationResult } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationInstall/utils/validateUrl'
import validateUrl from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationInstall/utils/validateUrl'

import VisibilityCondition from './VisibilityCondition'

import css from './VisibilityControls.less'

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

const visibilityMethodCaptionsOptions = (
    Object.keys(
        visibilityMethodCaptions,
    ) as GorgiasChatInstallationVisibilityMethod[]
).map((value) => ({ value, label: visibilityMethodCaptions[value], id: value }))

const matchConditionsCaptions: Record<
    GorgiasChatInstallationVisibilityMatchConditions,
    string
> = {
    [GorgiasChatInstallationVisibilityMatchConditions.Every]: 'All conditions',
    [GorgiasChatInstallationVisibilityMatchConditions.Some]:
        'At least one of the conditions',
}

const matchConditionsOptions = (
    Object.keys(
        matchConditionsCaptions,
    ) as GorgiasChatInstallationVisibilityMatchConditions[]
).map((value) => ({
    value,
    label: matchConditionsCaptions[value],
    id: value,
}))

const makeCondition = () => ({
    id: uuidv4(),
    value: '',
    operator: GorgiasChatInstallationVisibilityConditionOperator.Contain,
})

type VisibilityFormValues = {
    visibilityMethod: GorgiasChatInstallationVisibilityMethod
    matchConditions: GorgiasChatInstallationVisibilityMatchConditions
    conditions: GorgiasChatInstallationVisibilityCondition[]
}

export type VisibilityControlsHandle = {
    visibility: GorgiasChatInstallationVisibility
}

type Props = {
    integration: Map<string, unknown>
    open: () => void
    isOpen: boolean
    isUpdate: boolean
    canSubmit: boolean
    onSubmit: (visibility: GorgiasChatInstallationVisibility) => void
    onValidate: (isValid: boolean) => void
}

const VisibilityControls = (
    {
        integration,
        open,
        isOpen,
        isUpdate,
        canSubmit,
        onSubmit,
        onValidate,
    }: Props,
    ref: ForwardedRef<VisibilityControlsHandle>,
) => {
    const installationMeta = integration.getIn(
        ['meta', 'installation'],
        Map(),
    ) as Map<string, unknown>

    const installation: Maybe<GorgiasChatMetaInstallation> = installationMeta
        ? installationMeta.toJS()
        : undefined

    const initialVisibilityMethod =
        installation?.visibility?.method ||
        GorgiasChatInstallationVisibilityMethod.ShowOnEveryPage

    const {
        control,
        watch,
        getValues,
        formState: { isDirty },
    } = useForm<VisibilityFormValues>({
        mode: 'onChange',
        defaultValues: {
            visibilityMethod: initialVisibilityMethod,
            matchConditions:
                installation?.visibility?.match_conditions ||
                GorgiasChatInstallationVisibilityMatchConditions.Some,
            conditions: installation?.visibility?.conditions || [
                makeCondition(),
            ],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'conditions',
    })

    const [visibilityMethod, matchConditions, watchedConditions] = watch([
        'visibilityMethod',
        'matchConditions',
        'conditions',
    ])

    const computeVisibility =
        useCallback((): GorgiasChatInstallationVisibility => {
            const { visibilityMethod, matchConditions, conditions } =
                getValues()
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
        }, [getValues])

    useImperativeHandle(
        ref,
        () => ({
            get visibility() {
                return computeVisibility()
            },
        }),
        [computeVisibility],
    )

    const hasValidationError =
        watchedConditions?.some(
            ({ value, operator }) =>
                !!value && validateUrl(value, operator) !== 'valid',
        ) ?? false

    useEffect(() => {
        onValidate(!hasValidationError)
    }, [hasValidationError, onValidate])

    const hasIncompatibleConditions =
        matchConditions ===
            GorgiasChatInstallationVisibilityMatchConditions.Every &&
        watchedConditions?.filter(
            ({ operator }) =>
                operator ===
                GorgiasChatInstallationVisibilityConditionOperator.Equal,
        ).length > 1

    const isShowOnEveryPage =
        visibilityMethod ===
        GorgiasChatInstallationVisibilityMethod.ShowOnEveryPage

    const matchConditionsLabel =
        visibilityMethod ===
        GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages
            ? 'Show'
            : 'Hide'

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
                <span
                    className={css.visibilityMethodDropdownPlaceholderIcon}
                    onClick={open}
                >
                    <Icon name={IconName.EditPencil} />
                </span>
            </div>
            <Collapse isOpen={isOpen}>
                <Controller
                    control={control}
                    name="visibilityMethod"
                    render={({ field }) => (
                        <SelectField
                            items={visibilityMethodCaptionsOptions}
                            value={visibilityMethodCaptionsOptions.find(
                                (opt) => opt.value === field.value,
                            )}
                            onChange={(option) => field.onChange(option.value)}
                        >
                            {(option) => <ListItem label={option.label} />}
                        </SelectField>
                    )}
                />
                {!isShowOnEveryPage && (
                    <div className={css.visibilityControls}>
                        <div className={css.matchConditions}>
                            <span>
                                {matchConditionsLabel} on pages that match
                            </span>
                            <Controller
                                control={control}
                                name="matchConditions"
                                render={({ field }) => (
                                    <SelectField
                                        items={matchConditionsOptions}
                                        value={matchConditionsOptions.find(
                                            (opt) => opt.value === field.value,
                                        )}
                                        onChange={(option) =>
                                            field.onChange(option.value)
                                        }
                                    >
                                        {(option) => (
                                            <ListItem label={option.label} />
                                        )}
                                    </SelectField>
                                )}
                            />
                        </div>
                        <div className={css.conditions}>
                            {fields.map((field, index) => (
                                <Controller
                                    key={field.id}
                                    control={control}
                                    name={`conditions.${index}`}
                                    rules={{
                                        validate: (condition) => {
                                            if (!condition.value) return true
                                            const result = validateUrl(
                                                condition.value,
                                                condition.operator,
                                            )
                                            if (result === 'valid') return true
                                            return result
                                        },
                                    }}
                                    render={({
                                        field: { value: condition, onChange },
                                        fieldState: { error },
                                    }) => (
                                        <VisibilityCondition
                                            value={condition.value}
                                            operator={condition.operator}
                                            onChange={(values) =>
                                                onChange({
                                                    ...condition,
                                                    ...values,
                                                })
                                            }
                                            onDelete={() => remove(index)}
                                            validationResult={
                                                condition.value
                                                    ? (error?.message as UrlValidationResult)
                                                    : undefined
                                            }
                                            isDeletable={fields.length > 1}
                                        />
                                    )}
                                />
                            ))}
                        </div>
                        {hasIncompatibleConditions && (
                            <Banner
                                variant="inline"
                                intent={'warning'}
                                icon={IconName.TriangleWarning}
                                isClosable={false}
                                title={
                                    'The selected conditions are incompatible. '
                                }
                                size="md"
                            >
                                To make sure the chat is displayed correctly,
                                select At least one condition filter or remove a
                                condition.
                            </Banner>
                        )}
                    </div>
                )}
                <div className={css.footer}>
                    {!isShowOnEveryPage && (
                        <Button
                            variant={ButtonVariant.Tertiary}
                            intent={ButtonIntent.Regular}
                            onClick={() => append(makeCondition())}
                            leadingSlot={IconName.AddPlus}
                        >
                            Add URL
                        </Button>
                    )}
                    {isUpdate && !hideUpdateInstallationButton && (
                        <Button
                            onClick={() => onSubmit(computeVisibility())}
                            intent={ButtonIntent.Regular}
                            variant={ButtonVariant.Primary}
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

export default forwardRef<VisibilityControlsHandle, Props>(VisibilityControls)
