import type { KeyboardEvent } from 'react'
import { useCallback, useMemo } from 'react'

import { ListItem, SelectField, Text, TextField } from '@gorgias/axiom'

import {
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
    GORGIAS_CHAT_WIDGET_POSITION_OPTIONS,
} from 'config/integrations/gorgias_chat'
import type {
    GorgiasChatPosition,
    GorgiasChatPositionAlignmentEnum,
} from 'models/integration/types'

import css from './LauncherPositionPicker.less'

type PositionOption = {
    id: GorgiasChatPositionAlignmentEnum
    label: string
    value: GorgiasChatPositionAlignmentEnum
}

export type LauncherPositionPickerProps = {
    value: GorgiasChatPosition
    onChange: (position: GorgiasChatPosition) => void
}

const positionOptions: PositionOption[] =
    GORGIAS_CHAT_WIDGET_POSITION_OPTIONS.toJS().map(
        (option: {
            value: GorgiasChatPositionAlignmentEnum
            label: string
        }) => ({
            id: option.value,
            label: option.label,
            value: option.value,
        }),
    )

export function LauncherPositionPicker({
    value,
    onChange,
}: LauncherPositionPickerProps) {
    const position: GorgiasChatPosition = useMemo(
        () => ({
            alignment:
                value?.alignment ??
                GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.alignment,
            offsetX:
                value?.offsetX ?? GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.offsetX,
            offsetY:
                value?.offsetY ?? GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.offsetY,
        }),
        [value?.alignment, value?.offsetX, value?.offsetY],
    )

    const selectedPositionOption = useMemo(
        () =>
            positionOptions.find(
                (option) => option.value === position.alignment,
            ) ?? positionOptions[0],
        [position.alignment],
    )

    const handleAlignmentChange = useCallback(
        (option: PositionOption) => {
            onChange({
                ...position,
                alignment: option.value,
            })
        },
        [onChange, position],
    )

    const parseNumericValue = (inputValue: string): number => {
        const numericOnly = inputValue.replace(/[^0-9-]/g, '')
        const numValue = parseInt(numericOnly, 10)
        return isNaN(numValue) ? 0 : numValue
    }

    const handleOffsetChange = useCallback(
        (
            inputValue: string,
            offsetKey: keyof Pick<GorgiasChatPosition, 'offsetX' | 'offsetY'>,
        ) => {
            onChange({
                ...position,
                [offsetKey]: parseNumericValue(inputValue),
            })
        },
        [onChange, position],
    )

    const handleOffsetKeyDown = useCallback(
        (
            event: KeyboardEvent<HTMLInputElement>,
            offsetKey: keyof Pick<GorgiasChatPosition, 'offsetX' | 'offsetY'>,
        ) => {
            if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
                return
            }
            event.preventDefault()
            const increment = event.key === 'ArrowUp' ? 1 : -1
            onChange({
                ...position,
                [offsetKey]: position[offsetKey] + increment,
            })
        },
        [onChange, position],
    )

    return (
        <div className={css.wrapper}>
            <div className={css.header}>
                <Text variant="bold" size="md">
                    Launcher position
                </Text>
                <Text size="sm" className={css.caption}>
                    Control where the launcher sits on your page.
                </Text>
            </div>
            <div className={css.fieldsRow}>
                <div className={css.field}>
                    <SelectField
                        items={positionOptions}
                        value={selectedPositionOption}
                        onChange={handleAlignmentChange}
                        label="Position"
                        aria-label="Select launcher position"
                    >
                        {(option: PositionOption) => (
                            <ListItem
                                id={option.id}
                                label={option.label}
                                textValue={option.label}
                            />
                        )}
                    </SelectField>
                </div>
                <div className={css.field}>
                    <div className={css.pixelInputWrapper}>
                        <TextField
                            label="Move horizontally"
                            value={String(position.offsetX)}
                            onChange={(val) =>
                                handleOffsetChange(val, 'offsetX')
                            }
                            onKeyDown={(e) => handleOffsetKeyDown(e, 'offsetX')}
                            aria-label="Move launcher horizontally in pixels"
                        />
                        <span className={css.pixelSuffix}>px</span>
                    </div>
                </div>
                <div className={css.field}>
                    <div className={css.pixelInputWrapper}>
                        <TextField
                            label="Move vertically"
                            value={String(position.offsetY)}
                            onChange={(val) =>
                                handleOffsetChange(val, 'offsetY')
                            }
                            onKeyDown={(e) => handleOffsetKeyDown(e, 'offsetY')}
                            aria-label="Move launcher vertically in pixels"
                        />
                        <span className={css.pixelSuffix}>px</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
