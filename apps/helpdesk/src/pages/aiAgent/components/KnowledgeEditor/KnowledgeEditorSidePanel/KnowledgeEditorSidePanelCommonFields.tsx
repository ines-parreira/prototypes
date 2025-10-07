import { useCopyToClipboard, useId } from '@repo/hooks'
import _uniqueId from 'lodash/uniqueId'

import { Icon, IconSize, Tooltip } from '@gorgias/axiom'

import { DEFAULT_LOCALE } from 'domains/reporting/pages/common/utils'
import { selectText } from 'pages/common/components/CopyText/utils'
import { NewToggleButton } from 'pages/common/forms/NewToggleButton'

import css from './KnowledgeEditorSidePanelCommonFields.less'

const KNOWLEDGE_TYPE_ICON = {
    'help-center-article': 'file-document',
    guidance: 'nav-map',
    'document-snippet': 'paperclip-attachment',
    'url-snippet': 'link-horizontal',
    'store-snippet': 'nav-globe',
} as const

const KNOWLEDGE_TYPE_LABEL = {
    'help-center-article': 'Help Center article',
    guidance: 'Guidance',
    'document-snippet': 'Document',
    'url-snippet': 'URL',
    'store-snippet': 'Store website',
} as const

export const KnowledgeEditorSidePanelFieldKnowledgeType = ({
    type,
}: {
    type: keyof typeof KNOWLEDGE_TYPE_ICON
}) => (
    <span className={css.knowledgeType}>
        <Icon name={KNOWLEDGE_TYPE_ICON[type]} />{' '}
        <span>{KNOWLEDGE_TYPE_LABEL[type]}</span>
    </span>
)

export const KnowledgeEditorSidePanelFieldAIAgentStatus = ({
    checked,
    className,
    tooltip,
}: {
    checked: boolean
    className?: string
    tooltip?: string
}) => {
    const id = useId()

    return (
        <>
            <span id={`tooltip_${id}`}>
                <NewToggleButton
                    color="var(--surface-inverted-default)"
                    checked={checked}
                    isDisabled
                    onChange={() => {}}
                    size="small"
                    className={className}
                />
            </span>
            {tooltip && (
                <Tooltip target={`tooltip_${id}`} placement="top-end">
                    {tooltip}
                </Tooltip>
            )}
        </>
    )
}

const formatDate = (date: Date) => {
    return date.toLocaleDateString(DEFAULT_LOCALE, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

export const KnowledgeEditorSidePanelFieldDateField = ({
    date,
}: {
    date?: Date
}) => <span>{date ? formatDate(date) : '-'}</span>

export const KnowledgeEditorSidePanelFieldURL = ({ url }: { url: string }) => {
    const [, copyToClipboard] = useCopyToClipboard()
    const textId = _uniqueId(`copy-text`)

    const handleCopyCode = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ) => {
        e.stopPropagation()
        copyToClipboard(url)
        selectText(textId)
    }

    return (
        <span className={css.urlField}>
            <a
                href={url}
                className={css.urlLink}
                target="_blank"
                rel="noopener noreferrer"
            >
                <Icon name="external-link" size={IconSize.Sm} />

                <span className={css.urlText}>{url} </span>
            </a>

            <span onClick={handleCopyCode} className={css.copyButton}>
                <Icon name="copy" size={IconSize.Sm} />
            </span>
        </span>
    )
}

export const KnowledgeEditorSidePanelFieldDescription = ({
    description,
}: {
    description: string
}) => <div className={css.description}>{description}</div>

export const KnowledgeEditorSidePanelFieldPercentage = ({
    percentage, // between 0.0 and 1.0
}: {
    percentage?: number
}) => {
    if (!percentage) return '-'

    const formattedPercentage = (percentage * 100).toFixed(1)

    if (formattedPercentage.toString().endsWith('.0')) {
        return `${formattedPercentage.slice(0, -2)}%`
    }

    return `${formattedPercentage}%`
}
