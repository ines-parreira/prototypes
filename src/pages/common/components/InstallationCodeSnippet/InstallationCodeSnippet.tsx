import React from 'react'
import {useCopyToClipboard} from 'react-use'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import css from 'pages/common/components/InstallationCodeSnippet/InstallationCodeSnippet.less'

type Props = {
    code?: string
    onCopy?: () => void
}

const InstallationCodeSnippet = ({code, onCopy}: Props) => {
    const [state, copyToClipboard] = useCopyToClipboard()

    if (!code) {
        return (
            <>
                Could not generate the chat widget installation snippet, please
                retry later.
            </>
        )
    }

    const handleCopyCode = () => {
        copyToClipboard(code)
        onCopy?.()
    }

    const isCopied = Boolean(state.value)

    return (
        <div className={css.container}>
            <code className={css.code}>{code.trim()}</code>
            <Button intent="secondary" size="small" onClick={handleCopyCode}>
                <ButtonIconLabel icon={isCopied ? 'check' : 'content_copy'}>
                    {isCopied ? 'Copied' : 'Copy Code'}
                </ButtonIconLabel>
            </Button>
        </div>
    )
}

export default InstallationCodeSnippet
