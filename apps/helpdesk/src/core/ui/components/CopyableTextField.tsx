import { useEffect, useState } from 'react'

import { useCopyToClipboard } from '@repo/hooks'

import { Button, TextField, TextFieldProps } from '@gorgias/axiom'

export type CopyableTextFieldProps = TextFieldProps & {
    onCopy?: (value: string) => void
}

export const CopyableTextField = (props: CopyableTextFieldProps) => {
    const { value, onCopy } = props
    const [isCopied, setIsCopied] = useState(false)
    const [clipboardState, copyToClipboard] = useCopyToClipboard()

    const handleCopy = (value: string | undefined) => {
        if (value) {
            copyToClipboard(value)
        }
    }

    useEffect(() => {
        if (!clipboardState.value || clipboardState.error) {
            return
        }

        onCopy?.(clipboardState.value)
        setIsCopied(true)

        const timeout = setTimeout(() => {
            setIsCopied(false)
        }, 2000)

        return () => {
            setIsCopied(false)
            clearTimeout(timeout)
        }
    }, [clipboardState, onCopy])

    useEffect(() => {
        return () => {
            setIsCopied(false)
        }
    }, [value])

    return (
        <TextField
            {...props}
            suffix={
                <Button
                    intent="secondary"
                    leadingIcon="content_copy"
                    onClick={() => handleCopy(value)}
                    isDisabled={!value}
                >
                    {isCopied ? 'Copied!' : 'Copy'}
                </Button>
            }
        />
    )
}
