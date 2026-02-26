import CopyButton from 'pages/integrations/integration/components/gorgias_chat/legacy/components/revamp/CopyButton'

import css from './CodeSnippet.less'

type Props = {
    codeSnippet: string
    withCopyButton?: boolean
}

const CodeSnippet = ({ codeSnippet, withCopyButton = false }: Props) => {
    return (
        <div className={css.codeSnippet}>
            {withCopyButton && (
                <div className={css.copyButton}>
                    <CopyButton value={codeSnippet} displayText="Copy code" />
                </div>
            )}
            <pre>
                <code>{codeSnippet}</code>
            </pre>
        </div>
    )
}

export default CodeSnippet
