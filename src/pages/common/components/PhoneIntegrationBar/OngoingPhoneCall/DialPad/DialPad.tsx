import React, {useCallback, useState} from 'react'
import {Button, Popover, PopoverBody} from 'reactstrap'
import {Call} from '@twilio/voice-sdk'

import css from './DialPad.less'

type Props = {
    className?: string
    call: Call
}

const MAX_OUTPUT_LENGTH = 10
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
    [['*'], ['0', '+'], ['#']],
]

export default function DialPad({className, call}: Props): JSX.Element {
    const {isOpen, output, onToggle, onDigitClick} = useDialPad(call)
    const formattedOutput =
        output.length > MAX_OUTPUT_LENGTH
            ? `...${output.substring(output.length - MAX_OUTPUT_LENGTH)}`
            : output

    return (
        <>
            <Button
                id="dial-pad-button"
                data-testid="dial-pad-button"
                type="button"
                className={className}
            >
                <span className="material-icons">dialpad</span>
            </Button>
            <Popover
                placement="top"
                isOpen={isOpen}
                target="dial-pad-button"
                toggle={onToggle}
            >
                <PopoverBody>
                    <div className={css.container}>
                        <div className={css.output}>{formattedOutput}</div>
                        {rows.map((row, index) => (
                            <div key={index} className={css.row}>
                                {row.map(([digit, details]) => (
                                    <div
                                        key={digit}
                                        className={css.digit}
                                        tabIndex={0}
                                        data-digit={digit}
                                        data-testid={`digit-${digit}`}
                                        onClick={onDigitClick}
                                    >
                                        {digit}
                                        {!!details && (
                                            <div className={css.details}>
                                                {details}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </PopoverBody>
            </Popover>
        </>
    )
}

function useDialPad(call: Call) {
    const [isOpen, setIsOpen] = useState(false)
    const [output, setOutput] = useState('')

    const onToggle = useCallback(() => {
        setIsOpen(!isOpen)
    }, [isOpen, setIsOpen])

    const onDigitClick = useCallback(
        (event: React.SyntheticEvent<HTMLElement>) => {
            const {digit} = event.currentTarget.dataset
            if (!digit) {
                return
            }

            call.sendDigits(digit)
            setOutput(output + digit)
        },
        [call, output, setOutput]
    )

    return {isOpen, output, onToggle, onDigitClick}
}
