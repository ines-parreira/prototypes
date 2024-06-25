import {FieldValues, ResolverResult} from 'react-hook-form'
import _capitalize from 'lodash/capitalize'
import {Validator} from '@gorgias/api-validators'

export default function formValidationResolver<T extends FieldValues>(
    validator: Validator<T>
) {
    return (values: T): ResolverResult<T> => {
        const validationResult = validator(values)
        if (validationResult.isValid) {
            return {
                values: values,
                errors: {},
            }
        }

        return {
            values: values,
            errors: validationResult.errors.reduce(
                (acc, error) => ({
                    ...acc,
                    [error.path.replace('{base}.', '')]: {
                        message: _capitalize(error.message),
                    },
                }),
                {}
            ),
        }
    }
}
