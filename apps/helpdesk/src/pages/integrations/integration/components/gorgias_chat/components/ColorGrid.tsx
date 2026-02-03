import { useMemo } from 'react'

import css from './ColorGrid.less'

/**
 * Default hues for the color grid from axiom, covering the color spectrum.
 * Values are in degrees (0-360) on the HSL color wheel.
 */
const DEFAULT_HUES = [
    352, // Pink/Salmon
    24, // Red-Orange
    45, // Orange
    160, // Yellow-Orange
    190, // Yellow-Green/Olive
    205, // Green
    258, // Teal/Cyan
    310, // Blue-Purple
]

const DEFAULT_COLUMNS = 9

type ColorGridProps = {
    hues?: number[]
    columns?: number
    onColorSelect: (color: string) => void
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
    const saturationNormalised = saturation / 100
    const lightnessNormalised = lightness / 100

    const chroma =
        saturationNormalised *
        Math.min(lightnessNormalised, 1 - lightnessNormalised)
    const hslToRgbValue = (offset: number) => {
        const k = (offset + hue / 30) % 12
        const color =
            lightnessNormalised -
            chroma * Math.max(Math.min(k - 3, 9 - k, 1), -1)
        return Math.round(255 * color)
            .toString(16)
            .padStart(2, '0')
    }

    return `#${hslToRgbValue(0)}${hslToRgbValue(8)}${hslToRgbValue(4)}`.toUpperCase()
}

function generateColorGrid(hues: number[], columns: number): string[][] {
    return hues.map((hue) =>
        Array.from({ length: columns }, (_, colIndex) => {
            const lightness = 88 - colIndex * ((88 - 32) / (columns - 1))
            const saturation = 55 + colIndex * 4
            return hslToHex(hue, saturation, lightness)
        }),
    )
}

export function ColorGrid({
    hues = DEFAULT_HUES,
    columns = DEFAULT_COLUMNS,
    onColorSelect,
}: ColorGridProps) {
    const grid = useMemo(
        () => generateColorGrid(hues, columns),
        [hues, columns],
    )

    return (
        <div
            className={css.grid}
            style={
                {
                    '--grid-columns': columns,
                } as React.CSSProperties
            }
        >
            {grid.map((row, rowIndex) =>
                row.map((color, colIndex) => (
                    <button
                        key={`${rowIndex}-${colIndex}`}
                        type="button"
                        className={css.swatch}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                        onClick={() => onColorSelect(color)}
                    />
                )),
            )}
        </div>
    )
}
