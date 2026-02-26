import { useEffect, useRef, useState } from 'react'

import copy from 'copy-to-clipboard'

import { Button, ButtonIntent, ButtonVariant, IconName } from '@gorgias/axiom'

type Props = {
    value: string
    displayText: string
    variant?: ButtonVariant
    intent?: ButtonIntent
}

const CopyButton = ({
    value: valueToCopy,
    displayText,
    variant = ButtonVariant.Primary,
    intent = ButtonIntent.Regular,
}: Props) => {
    const [isCopied, setIsCopied] = useState(false)
    const copyTimerRef = useRef<number | null>(null)

    useEffect(() => {
        return () => {
            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current)
            }
        }
    }, [])

    const copyValue = () => {
        copy(valueToCopy)

        if (copyTimerRef.current) {
            clearTimeout(copyTimerRef.current)
        }

        setIsCopied(true)
        copyTimerRef.current = setTimeout(() => {
            setIsCopied(false)
            copyTimerRef.current = null
        }, 5000) as unknown as number
    }

    return (
        <Button
            variant={variant}
            intent={intent}
            leadingSlot={isCopied ? IconName.Check : IconName.Copy}
            onClick={copyValue}
        >
            {isCopied ? 'Copied' : displayText}
        </Button>
    )
}

export default CopyButton
