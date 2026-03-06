import { useCallback, useEffect, useMemo, useState } from 'react'

import {
    Box,
    Button,
    ListItem,
    Modal,
    ModalSize,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    SelectField,
    TextField,
} from '@gorgias/axiom'

import type { ButtonAction, Parameter } from '../utils/customActionTypes'

type Props = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    action: ButtonAction
    label: string
    onExecute: (modifiedAction: ButtonAction) => void
}

function splitDropdownValues(value?: string): string[] {
    if (!value) return []
    return value
        .split(';')
        .map((v) => v.trim())
        .filter(Boolean)
}

type EditableParam = {
    source: 'headers' | 'params' | 'body'
    index: number
    param: Parameter
}

function collectEditableParams(action: ButtonAction): EditableParam[] {
    const result: EditableParam[] = []

    const collect = (params: Parameter[], source: EditableParam['source']) => {
        params.forEach((param, index) => {
            if (param.editable || param.type === 'dropdown') {
                result.push({ source, index, param })
            }
        })
    }

    collect(action.headers, 'headers')
    collect(action.params, 'params')
    collect(action.body['application/x-www-form-urlencoded'], 'body')

    return result
}

export function hasEditableParameters(action: ButtonAction): boolean {
    return collectEditableParams(action).length > 0
}

function EditableField({
    param,
    value,
    onChange,
}: {
    param: Parameter
    value: string
    onChange: (value: string) => void
    fieldIndex: number
}) {
    const fieldLabel = param.label || param.key
    const isDropdown = param.type === 'dropdown'

    if (isDropdown) {
        const options = splitDropdownValues(param.value)
        const items = options.map((opt) => ({ id: opt, name: opt }))
        const selectedItem = items.find((item) => item.id === value)

        return (
            <SelectField
                items={items}
                value={selectedItem}
                onChange={(item: { id: string; name: string }) =>
                    onChange(item.id)
                }
                label={`${fieldLabel}${param.mandatory ? ' *' : ''}`}
                placeholder="Select a value"
            >
                {(item: { id: string; name: string }) => (
                    <ListItem id={item.id} label={item.name} />
                )}
            </SelectField>
        )
    }

    return (
        <TextField
            label={fieldLabel}
            value={value}
            onChange={onChange}
            isRequired={param.mandatory}
        />
    )
}

export function ActionEditorDialog({
    isOpen,
    onOpenChange,
    action,
    label,
    onExecute,
}: Props) {
    const [localAction, setLocalAction] = useState<ButtonAction>(action)

    const editableParams = useMemo(
        () => collectEditableParams(action),
        [action],
    )

    useEffect(() => {
        if (!isOpen) return

        const cloned = structuredClone(action)

        const initParam = (param: Parameter) => {
            if (param.type === 'dropdown' && param.mandatory) {
                const options = splitDropdownValues(param.value)
                if (options.length > 0 && !param.value) {
                    param.value = options[0]
                }
            }
        }

        cloned.headers.forEach(initParam)
        cloned.params.forEach(initParam)
        cloned.body['application/x-www-form-urlencoded'].forEach(initParam)

        setLocalAction(cloned)
    }, [isOpen, action])

    const getParamValue = useCallback(
        (ep: EditableParam): string => {
            const source =
                ep.source === 'body'
                    ? localAction.body['application/x-www-form-urlencoded']
                    : localAction[ep.source]
            return source[ep.index]?.value ?? ''
        },
        [localAction],
    )

    const setParamValue = useCallback((ep: EditableParam, value: string) => {
        setLocalAction((prev) => {
            const next = structuredClone(prev)
            const source =
                ep.source === 'body'
                    ? next.body['application/x-www-form-urlencoded']
                    : next[ep.source]
            if (source[ep.index]) {
                source[ep.index].value = value
            }
            return next
        })
    }, [])

    const handleExecute = useCallback(() => {
        const hasMissingRequired = editableParams.some((ep) => {
            if (!ep.param.mandatory) return false
            const source =
                ep.source === 'body'
                    ? localAction.body['application/x-www-form-urlencoded']
                    : localAction[ep.source]
            const val = source[ep.index]?.value ?? ''
            return val.trim() === ''
        })

        if (hasMissingRequired) return

        onExecute(localAction)
    }, [editableParams, localAction, onExecute])

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size={ModalSize.Sm}
            aria-label={`Edit parameters for ${label}`}
        >
            <OverlayHeader title={label} />
            <OverlayContent>
                <Box flexDirection="column" gap="md">
                    {editableParams.map((ep, fieldIndex) => (
                        <EditableField
                            key={`${ep.source}-${ep.index}`}
                            param={ep.param}
                            value={getParamValue(ep)}
                            onChange={(val) => setParamValue(ep, val)}
                            fieldIndex={fieldIndex}
                        />
                    ))}
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="sm">
                    <Button
                        variant="tertiary"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleExecute}>
                        Execute
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
