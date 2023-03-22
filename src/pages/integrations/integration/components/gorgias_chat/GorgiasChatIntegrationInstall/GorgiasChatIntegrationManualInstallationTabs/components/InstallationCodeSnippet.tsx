import React from 'react'
import {useCopyToClipboard} from 'react-use'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import css from './InstallationCodeSnippet.less'

type Props = {
    code: string
}

const InstallationCodeSnippet = ({code}: Props) => {
    const [state, copyToClipboard] = useCopyToClipboard()

    const handleCopyCode = () => {
        copyToClipboard(code)
    }

    const isCopied = Boolean(state.value)

    return (
        <div className={css.container}>
            <code className={css.code}>{code}</code>
            <Button intent="secondary" size="small" onClick={handleCopyCode}>
                <ButtonIconLabel icon={isCopied ? 'check' : 'content_copy'}>
                    {isCopied ? 'Copied' : 'Copy Code'}
                </ButtonIconLabel>
            </Button>
        </div>
    )
}

export default InstallationCodeSnippet
