import type React from 'react'

import {
    Box,
    Button,
    Tag,
    toast,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'
import type { MetafieldType } from '@gorgias/helpdesk-types'

import { extractGid, prepareGidUrl } from './helpers/Gid'
import { shortenUrl } from './helpers/shortenUrl'
import { formatDate, formatDateTime } from './metafieldUtils'

import css from './MetafieldValue.less'

export type MetafieldProps = {
    value: string
}

function truncateStr(value: string, length: number): string {
    if (value.length <= length) return value
    return value.substring(0, length) + '...'
}

export function FieldWithCopyButton({
    value,
    children,
    tooltip,
}: {
    value: string
    children?: React.ReactNode
    tooltip?: boolean
}) {
    const isTrimmed = value.length > 80
    const shortenedValue = truncateStr(value, 80)

    async function handleCopy(e: React.MouseEvent) {
        e.stopPropagation()
        try {
            await navigator.clipboard.writeText(value)
            toast.success('Copied to clipboard')
        } catch {
            // ignore
        }
    }

    const content = (
        <div className={css.field}>
            {children ?? shortenedValue}
            <span className={css.copyButton}>
                <Button
                    as="button"
                    icon="copy"
                    intent="regular"
                    size="sm"
                    variant="tertiary"
                    onClick={handleCopy}
                    aria-label="Copy to clipboard"
                />
            </span>
        </div>
    )

    if (isTrimmed && tooltip) {
        return (
            <Tooltip>
                <TooltipTrigger>{content}</TooltipTrigger>
                <TooltipContent>
                    <pre className={css.tooltip}>{value}</pre>
                </TooltipContent>
            </Tooltip>
        )
    }

    return content
}

export function UrlMetafield({ value }: MetafieldProps) {
    return (
        <FieldWithCopyButton value={value}>
            <a href={value} target="_blank" rel="noreferrer">
                {value}
            </a>
        </FieldWithCopyButton>
    )
}

export function DateMetafield({ value }: MetafieldProps) {
    return (
        <FieldWithCopyButton value={value}>
            {formatDate(value)}
        </FieldWithCopyButton>
    )
}

export function DateTimeMetafield({ value }: MetafieldProps) {
    return (
        <FieldWithCopyButton value={value}>
            {formatDateTime(value)}
        </FieldWithCopyButton>
    )
}

export function BooleanMetafield({ value }: { value: boolean }) {
    const text = value ? 'true' : 'false'
    return (
        <FieldWithCopyButton value={text}>
            <Tag color={value ? 'green' : 'red'}>{text}</Tag>
        </FieldWithCopyButton>
    )
}

export function DimensionMetafield({
    value,
}: {
    value: { value: number | string; unit: string }
}) {
    let unit = String(value.unit)
    if (unit === 'l') {
        unit = 'L'
    } else {
        unit = unit.replace(/_/g, ' ').replace(/us/g, '').replace(/3/g, '³')
    }
    const copiableValue = `${value.value} ${unit}`
    return <FieldWithCopyButton value={copiableValue} />
}

export function RatingMetafield({
    value,
}: {
    value: { value: string | number; scale_max: string | number }
}) {
    const copiableValue = `${value.value} out of ${value.scale_max}`
    return <FieldWithCopyButton value={copiableValue} />
}

export function MoneyMetafield({
    value,
}: {
    value: { amount: string; currency_code: string }
}) {
    const copiableValue = `${value.amount} ${value.currency_code}`
    return <FieldWithCopyButton value={copiableValue} />
}

export function ColorMetafield({ value }: MetafieldProps) {
    return (
        <FieldWithCopyButton value={value}>
            <Box flexDirection="row" alignItems="center" gap="xxs">
                <span
                    className={css.colorSwatch}
                    style={{ backgroundColor: value }}
                />
                <span>{value}</span>
            </Box>
        </FieldWithCopyButton>
    )
}

export function ReferenceMetafield({
    value,
    type,
    storeName,
}: {
    value: string
    type: MetafieldType | string
    storeName?: string
}) {
    const gid = extractGid(value)
    if (!gid) return null

    if (storeName) {
        const url = prepareGidUrl(type, storeName, gid)
        if (url) {
            return (
                <FieldWithCopyButton value={gid}>
                    <a href={url} target="_blank" rel="noreferrer">
                        {gid}
                    </a>
                </FieldWithCopyButton>
            )
        }
    }

    return <FieldWithCopyButton value={gid} />
}

export function LinkMetafield({
    value,
}: {
    value: { text: string; url: string }
}) {
    const displayText = value.text || shortenUrl(value.url)
    return (
        <FieldWithCopyButton value={value.url}>
            <a href={value.url} target="_blank" rel="noreferrer">
                {displayText}
            </a>
        </FieldWithCopyButton>
    )
}

export function RichTextFieldMetafield({
    value,
}: {
    value: Record<string, unknown>
}) {
    const render = (node: Record<string, unknown>): string => {
        if ('type' in node && 'value' in node && node.type === 'text') {
            return String(node.value)
        }
        if (Array.isArray(node.children)) {
            return (node.children as Record<string, unknown>[])
                .map(render)
                .join(' ')
        }
        return ''
    }
    const compactValue = render(value)
    return <FieldWithCopyButton value={compactValue} tooltip={true} />
}

export function JsonMetafield({ value }: { value: Record<string, unknown> }) {
    const formattedJson = JSON.stringify(value, null, 4)
    return <FieldWithCopyButton value={formattedJson} tooltip={true} />
}
