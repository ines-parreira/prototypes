import React, { useState } from 'react'

import { Call } from '@twilio/voice-sdk'
import { Popover, PopoverBody } from 'reactstrap'

import DialPad from 'pages/integrations/integration/components/phone/DialPad'

import IconButtonTooltip from '../IconButtonTooltip'

import css from './InCallDialPad.less'

type Props = {
    className?: string
    call: Call
}

const MAX_OUTPUT_LENGTH = 10

export default function InCallDialPad({ className, call }: Props): JSX.Element {
    const [isOpen, setIsOpen] = useState(false)
    const [output, setOutput] = useState('')

    const handleDigitClick = (digit: string) => {
        call.sendDigits(digit)
    }

    const formattedOutput =
        output.length > MAX_OUTPUT_LENGTH
            ? `...${output.substring(output.length - MAX_OUTPUT_LENGTH)}`
            : output

    return (
        <>
            <IconButtonTooltip
                id="dial-pad-button"
                aria-label="Phone dial pad"
                className={className}
                intent="secondary"
                icon="dialpad"
            >
                Dialpad
            </IconButtonTooltip>
            <Popover
                placement="top"
                isOpen={isOpen}
                target="dial-pad-button"
                toggle={() => setIsOpen((open) => !open)}
            >
                <PopoverBody>
                    <div className={css.container}>
                        <div className={css.output}>{formattedOutput}</div>
                        <div className={css.dialpad}>
                            <DialPad
                                value={output}
                                onChange={setOutput}
                                onDigitClick={handleDigitClick}
                            />
                        </div>
                    </div>
                </PopoverBody>
            </Popover>
        </>
    )
}
