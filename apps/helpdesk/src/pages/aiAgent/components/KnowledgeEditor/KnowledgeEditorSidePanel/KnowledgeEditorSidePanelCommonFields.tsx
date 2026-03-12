import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { useCopyToClipboard, useId } from '@repo/hooks'
import _uniqueId from 'lodash/uniqueId'

import {
    Button,
    Icon,
    IconSize,
    LegacyTooltip,
    Tag,
    ToggleField,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { DEFAULT_LOCALE } from 'domains/reporting/pages/common/utils'
import type { GuidanceModeType } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context/types'
import { selectText } from 'pages/common/components/CopyText/utils'

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
    onChange,
    isDisabled,
    showMultiLanguageInfo,
    multiLanguageTooltip,
}: {
    checked: boolean
    className?: string
    tooltip?: string
    onChange?: (value: boolean) => void
    isDisabled?: boolean
    showMultiLanguageInfo?: boolean
    multiLanguageTooltip?: string | ReactNode
}) => {
    const id = useId()

    return (
        <div className={css.aiAgentStatusWrapper}>
            <span id={`tooltip_${id}`} className={className}>
                <ToggleField
                    value={checked}
                    isDisabled={!onChange || isDisabled}
                    onChange={onChange ?? (() => {})}
                />
            </span>
            {tooltip && (
                <LegacyTooltip target={`tooltip_${id}`} placement="top-end">
                    {tooltip}
                </LegacyTooltip>
            )}
            {showMultiLanguageInfo && multiLanguageTooltip && (
                <Tooltip
                    trigger={
                        <span role="button" tabIndex={0}>
                            <Icon name="info" color="ai" />
                        </span>
                    }
                >
                    {typeof multiLanguageTooltip === 'string' ? (
                        <TooltipContent caption={multiLanguageTooltip} />
                    ) : (
                        <TooltipContent>{multiLanguageTooltip}</TooltipContent>
                    )}
                </Tooltip>
            )}
        </div>
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

export const KnowledgeEditorSidePanelFieldURL = ({ url }: { url?: string }) => {
    const [copyState, copyToClipboard] = useCopyToClipboard()
    const [showCheckmark, setShowCheckmark] = useState(false)
    const textId = _uniqueId(`copy-text`)

    useEffect(() => {
        if (copyState.value) {
            setShowCheckmark(true)
            const timer = setTimeout(() => {
                setShowCheckmark(false)
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [copyState])

    const handleCopyCode = (e: React.MouseEvent) => {
        e.stopPropagation()
        copyToClipboard(url ?? '')
        selectText(textId)
    }

    return url ? (
        <span className={css.urlField}>
            <a
                href={url}
                className={css.urlLink}
                target="_blank"
                rel="noopener noreferrer"
            >
                {url}
            </a>

            <Tooltip
                trigger={
                    <Button
                        onClick={handleCopyCode}
                        icon={showCheckmark ? 'check-all' : 'copy'}
                        size="sm"
                        variant="tertiary"
                    />
                }
            >
                <TooltipContent caption="Copy URL" />
            </Tooltip>
        </span>
    ) : (
        '-'
    )
}

export const KnowledgeEditorSidePanelFieldSourceDocument = ({
    sourceDocument,
}: {
    sourceDocument: {
        label: string
        downloadUrl: string
    }
}) => {
    const id = useId()

    return (
        <Tooltip
            trigger={
                <a
                    href={sourceDocument.downloadUrl}
                    className={css.documentField}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span className={css.documentFieldText}>
                        {sourceDocument.label}
                    </span>

                    <span id={`tooltip_${id}`}>
                        <Icon name="download" size={IconSize.Xs} />
                    </span>
                </a>
            }
        >
            <TooltipContent caption="Click to download" />
        </Tooltip>
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

export const KnowledgeEditorSidePanelFieldStatus = ({
    isDraft,
    mode,
}: {
    isDraft: boolean
    mode?: GuidanceModeType
}) => {
    if (mode === 'create') {
        return <span>-</span>
    }

    return (
        <Tag color={isDraft ? 'grey' : 'green'}>
            {isDraft ? 'Draft' : 'Published'}
        </Tag>
    )
}
