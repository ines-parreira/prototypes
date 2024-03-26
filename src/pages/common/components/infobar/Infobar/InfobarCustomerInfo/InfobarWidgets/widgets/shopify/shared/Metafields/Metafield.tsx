import React, {createRef, useContext} from 'react'
import {isArray, map, startCase, truncate} from 'lodash'
import {ShopifyMetafield} from '@gorgias/api-queries'
import StaticField from 'Infobar/features/Field/display/StaticField'
import CopyButton from 'Infobar/features/Field/components/CopyButton'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import Badge from 'gorgias-design-system/Badge/Badge'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import Tooltip from 'pages/common/components/Tooltip'
import {DateAndTimeFormatting} from 'constants/datetime'
import {extractGid, prepareGidUrl, shortenUrl} from '../helpers'
import css from './Metafield.less'

type Props = {
    metafield: ShopifyMetafield
}

export default function Metafield({metafield}: Props) {
    const integrationContext = useContext(IntegrationContext)
    const key = metafield.key || ''

    switch (metafield.type) {
        case 'multi_line_text_field':
        case 'single_line_text_field':
        case 'variant_reference':
        case 'file_reference':
        case 'metaobject_reference':
        case 'mixed_reference':
        case 'number_decimal':
        case 'number_integer': {
            return (
                <FieldWithCopyButton
                    label={key}
                    value={String(metafield.value)}
                />
            )
        }

        case 'date': {
            return (
                <FieldWithCopyButton label={key} value={metafield.value}>
                    <DatetimeLabel
                        dateTime={metafield.value}
                        hasTooltip={false}
                        labelFormat={DateAndTimeFormatting.ShortDateWithYear}
                    />
                </FieldWithCopyButton>
            )
        }
        case 'date_time': {
            return (
                <FieldWithCopyButton label={key} value={metafield.value}>
                    <DatetimeLabel
                        dateTime={metafield.value}
                        hasTooltip={false}
                        labelFormat={DateAndTimeFormatting.ShortDateWithYear}
                    />
                    {' ('}
                    <DatetimeLabel
                        dateTime={metafield.value}
                        hasTooltip={false}
                        labelFormat={DateAndTimeFormatting.TimeDoubleDigitHour}
                    />
                    {')'}
                </FieldWithCopyButton>
            )
        }

        case 'boolean': {
            const value = metafield.value ? 'true' : 'false'
            return (
                <FieldWithCopyButton label={key} value={value}>
                    <Badge
                        label={value}
                        color={'accessoryGreen'}
                        className={css.badge}
                    />
                </FieldWithCopyButton>
            )
        }

        case 'product_reference':
        case 'collection_reference':
        case 'page_reference': {
            const gid = extractGid(metafield.value)
            const storeName = integrationContext?.integration?.get('name')
            if (storeName && gid) {
                const url = prepareGidUrl(
                    metafield.type,
                    storeName as string,
                    gid
                )
                return url ? (
                    <FieldWithCopyButton label={key} value={gid}>
                        <a href={url}>{gid}</a>
                    </FieldWithCopyButton>
                ) : null
            }
            return null
        }
        case 'url': {
            return metafield.value ? (
                <FieldWithCopyButton label={key} value={metafield.value}>
                    <a href={metafield.value}>{shortenUrl(metafield.value)}</a>
                </FieldWithCopyButton>
            ) : null
        }

        case 'color': {
            return <ColorMetafield label={key} value={metafield.value} />
        }

        case 'json': {
            return (
                <FieldWithCopyButtonAndTooltip
                    label={key}
                    value={metafield.value}
                />
            )
        }

        case 'rich_text_field':
            return (
                <RichTextFieldMetafield label={key} value={metafield.value} />
            )

        case 'weight':
        case 'volume':
        case 'dimension': {
            const {value, unit} = metafield.value
            const copiableValue = `${value} ${unit.replace(/_/g, ' ')}`
            return <FieldWithCopyButton label={key} value={copiableValue} />
        }

        case 'rating': {
            const {scale_max, value} = metafield.value
            const copiableValue = `${value} out of ${scale_max}`
            return <FieldWithCopyButton label={key} value={copiableValue} />
        }

        case 'money': {
            const {amount, currency} = metafield.value
            const copiableValue = `${amount} ${currency}`
            return (
                <FieldWithCopyButton label={key} value={copiableValue}>
                    <MoneyAmount
                        renderIfZero
                        amount={String(amount)}
                        currencyCode={currency ? currency : null}
                    />
                </FieldWithCopyButton>
            )
        }

        default: {
            return <></>
        }
    }
}

type FieldWithCopyButtonProps = {
    children?: React.ReactNode
    label: string
    value: string
}

function FieldWithCopyButton({
    label,
    value,
    children,
}: FieldWithCopyButtonProps) {
    const shortenedValue = truncate(value, {length: 80})
    return (
        <div className={css.field}>
            <StaticField label={startCase(label)}>
                {children ?? shortenedValue}
                <span className={css.copyButton}>
                    <CopyButton value={value} />
                </span>
            </StaticField>
        </div>
    )
}

function ColorMetafield({label, value}: {label: string; value: string}) {
    return (
        <div className={css.field}>
            <StaticField label={startCase(label)}>
                <svg className={css.colorBadge}>
                    <circle
                        cx={7}
                        cy={7}
                        r={6.665}
                        stroke={value}
                        strokeWidth={0}
                        fill={value}
                    />
                </svg>
                <span className={css.colorValue}>{value}</span>
            </StaticField>
            <span className={css.copyButton}>
                <CopyButton value={value} />
            </span>
        </div>
    )
}

function RichTextFieldMetafield({
    label,
    value,
}: {
    label: string
    value: Record<string, unknown>
}) {
    const render = (node: Record<string, unknown>): string => {
        if ('type' in node && 'value' in node && node.type === 'text') {
            return String(node.value)
        }

        if (isArray(node.children)) {
            return map(node.children, render).join(' ')
        }

        return ''
    }

    return <FieldWithCopyButton label={label} value={render(value)} />
}

type FieldWithCopyButtonAndTooltipProps = {
    children?: React.ReactNode
    label: string
    value: object
}

function FieldWithCopyButtonAndTooltip({
    label,
    value,
    children,
}: FieldWithCopyButtonAndTooltipProps) {
    const ref = createRef<HTMLDivElement>()
    const formattedJson = JSON.stringify(value, null, 4)
    const shortenedValue = truncate(formattedJson, {length: 80})
    return (
        <>
            <div className={css.field} ref={ref}>
                <StaticField label={startCase(label)}>
                    {children ?? shortenedValue}
                    <span className={css.copyButton}>
                        <CopyButton value={formattedJson} />
                    </span>
                </StaticField>
            </div>
            <Tooltip target={ref} placement="top">
                <pre className={css.tooltip}>{formattedJson}</pre>
            </Tooltip>
        </>
    )
}
