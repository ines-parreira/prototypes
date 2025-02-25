import React from 'react'

import css from './DialPad.less'

type Props = {
    value: string
    onChange?: (value: string) => void
    onDigitClick?: (digit: string) => void
}

const rows = [
    [['1'], ['2', 'ABC'], ['3', 'DEF']],
    [
        ['4', 'GHI'],
        ['5', 'JKL'],
        ['6', 'MNO'],
    ],
    [
        ['7', 'PQRS'],
        ['8', 'TUV'],
        ['9', 'WXYZ'],
    ],
    [['*'], ['0'], ['#']],
]

export default function DialPad({
    value,
    onChange,
    onDigitClick,
}: Props): JSX.Element {
    const handleDigitClick = (event: React.SyntheticEvent<HTMLElement>) => {
        const { digit } = event.currentTarget.dataset

        if (!digit) {
            return
        }

        onDigitClick?.(digit)
        onChange?.(value + digit)
    }

    return (
        <div className={css.container}>
            {rows.map((row, index) => (
                <div key={index} className={css.row}>
                    {row.map(([digit, details]) => (
                        <div
                            key={digit}
                            className={css.digit}
                            tabIndex={0}
                            data-digit={digit}
                            onClick={handleDigitClick}
                        >
                            {digit}
                            {!!details && (
                                <div className={css.details}>{details}</div>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}
