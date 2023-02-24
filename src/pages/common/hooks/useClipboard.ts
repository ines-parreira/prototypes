import {useEffect, useState} from 'react'
import Clipboard from 'clipboard'

export default function useClipboard(selector: string) {
    const [isCopied, setIsCopied] = useState(false)

    useEffect(() => {
        const clipboard = new Clipboard(selector)

        clipboard.on('success', () => {
            setIsCopied(true)

            setTimeout(() => {
                setIsCopied(false)
            }, 1500)
        })

        return () => {
            clipboard.destroy()
        }
    }, [selector])

    return {
        copyButtonText: isCopied ? 'Copied!' : 'Copy',
    }
}
