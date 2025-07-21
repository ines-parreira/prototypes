import { capitalize, isArray, isObject } from 'lodash'
import type { FieldErrors, FieldValues, ResolverResult } from 'react-hook-form'

import { ValidationResult, Validator } from '@gorgias/helpdesk-validators'

export type FormErrors<V extends FieldValues> = Partial<
    Record<keyof V, unknown>
>
export type FormValidator<V extends FieldValues> = (
    values: V,
) => FormErrors<V> | undefined

export function toFieldErrors<V extends FieldValues>(
    errors: FormErrors<V>,
): FieldErrors<V> {
    return Object.entries(errors).reduce((acc, [field, error]) => {
        if (typeof error === 'string') {
            return { ...acc, [field]: { type: 'string', message: error } }
        }

        if (isArray(error)) {
            if (error.every((error) => typeof error === 'string')) {
                return {
                    ...acc,
                    [field]: { type: 'string', message: error[0] },
                }
            }

            return {
                ...acc,
                [field]: error.map(toFieldErrors),
            }
        }

        if (isObject(error)) {
            return {
                ...acc,
                [field]: toFieldErrors(error),
            }
        }

        return acc
    }, {})
}

export function toFormErrors<V extends FieldValues>(
    result: ValidationResult<V>,
): FormErrors<V> {
    return (result.errors ?? []).reduce(
        (acc, error) => ({
            ...acc,
            [error.path.replace('{base}.', '')]: capitalize(error.message),
        }),
        {} as FormErrors<V>,
    )
}

export function createResolver<V extends FieldValues>(
    validator: FormValidator<V>,
) {
    return (values: V): ResolverResult<V> => {
        const errors = validator(values) ?? {}
        return {
            errors: toFieldErrors(errors),
            values,
        }
    }
}

export function createFormValidator<V extends FieldValues>(
    ajvValidator: Validator<V>,
): FormValidator<V> {
    return (values: V) => toFormErrors(ajvValidator(values))
}
