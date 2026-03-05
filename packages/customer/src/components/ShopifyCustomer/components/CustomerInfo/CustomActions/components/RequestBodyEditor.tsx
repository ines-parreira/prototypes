import { useState } from 'react'

import { useController, useWatch } from '@repo/forms'

import { Box, ListItem, SelectField, TextAreaField } from '@gorgias/axiom'

import { CONTENT_TYPES } from '../utils/customActionConstants'
import type { ContentType } from '../utils/customActionTypes'
import { ParameterList } from './ParameterList'

type SelectItem = { id: string; name: string }

type Props = {
    name: string
}

function stringifyJsonBody(value: Record<string, unknown> | string): string {
    if (typeof value === 'string') return value
    return JSON.stringify(value, null, 2)
}

export function RequestBodyEditor({ name }: Props) {
    const contentType = useWatch({ name: `${name}.contentType` })

    const contentTypeController = useController({
        name: `${name}.contentType`,
    })
    const jsonController = useController({
        name: `${name}.application/json`,
    })

    const selectedContentType =
        CONTENT_TYPES.find((c) => c.id === contentType) ?? CONTENT_TYPES[0]

    const jsonBodyString = stringifyJsonBody(jsonController.field.value)
    const [jsonError, setJsonError] = useState<string>()

    function handleJsonBodyChange(val: string) {
        try {
            jsonController.field.onChange(JSON.parse(val))
            setJsonError(undefined)
        } catch {
            jsonController.field.onChange(val)
            setJsonError('Invalid JSON syntax')
        }
    }

    return (
        <Box flexDirection="column" gap="xs">
            <SelectField
                items={CONTENT_TYPES}
                value={selectedContentType}
                onChange={(item: SelectItem) =>
                    contentTypeController.field.onChange(item.id as ContentType)
                }
                label="Content type"
            >
                {(item: SelectItem) => (
                    <ListItem id={item.id} label={item.name} />
                )}
            </SelectField>

            {contentType === 'application/json' ? (
                <TextAreaField
                    label="Body (JSON)"
                    value={jsonBodyString === '{}' ? '' : jsonBodyString}
                    onChange={handleJsonBodyChange}
                    rows={5}
                    placeholder='{"key": "value"}'
                    error={jsonError}
                    isInvalid={!!jsonError}
                />
            ) : (
                <ParameterList
                    name={`${name}.application/x-www-form-urlencoded`}
                    label="Body (Form)"
                />
            )}
        </Box>
    )
}
