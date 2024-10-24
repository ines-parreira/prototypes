import {
    DimensionShopifyMetafieldData,
    MoneyShopifyMetafield,
    RatingShopifyMetafieldData,
    ShopifyMetafield,
    VolumeShopifyMetafieldData,
    WeightShopifyMetafieldData,
} from '@gorgias/api-queries'
import {ShopifyMetafieldType} from '@gorgias/api-types'
import {Tooltip} from '@gorgias/ui-kit'
import {isArray, map, startCase, truncate} from 'lodash'
import React, {createRef, useContext} from 'react'

import {DateAndTimeFormatting} from 'constants/datetime'
import {Badge} from 'gorgias-design-system/Badge/Badge'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'

import {StaticField, CopyButton} from 'Widgets/modules/Template/modules/Field'

import {extractGid, prepareGidUrl} from '../helpers/Gid'
import {shortenUrl} from '../helpers/shortenUrl'
import css from './Metafield.less'

type Props = {
    metafield: ShopifyMetafield
}

export default function Metafield({metafield}: Props) {
    const label = metafield.key || ''

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
                <FieldWrapper label={label}>
                    <FieldWithCopyButton
                        value={String(metafield.value)}
                        tooltip={
                            metafield.type === 'single_line_text_field' ||
                            metafield.type === 'multi_line_text_field'
                        }
                    />
                </FieldWrapper>
            )
        }

        case 'date': {
            return (
                <FieldWrapper label={label}>
                    <DateMetafield value={metafield.value} />
                </FieldWrapper>
            )
        }

        case 'date_time': {
            return (
                <FieldWrapper label={label}>
                    <DateTimeMetafield value={metafield.value} />
                </FieldWrapper>
            )
        }

        case 'boolean': {
            return (
                <FieldWrapper label={label}>
                    <BooleanMetafield value={metafield.value} />
                </FieldWrapper>
            )
        }

        case 'product_reference':
        case 'collection_reference':
        case 'page_reference': {
            return (
                <FieldWrapper label={label}>
                    <ReferenceMetafield
                        value={metafield.value}
                        type={metafield.type}
                    />
                </FieldWrapper>
            )
        }
        case 'url': {
            return (
                <FieldWrapper label={label}>
                    <UrlMetafield value={metafield.value} />
                </FieldWrapper>
            )
        }

        case 'color': {
            return (
                <FieldWrapper label={label}>
                    <ColorMetafield value={metafield.value} />
                </FieldWrapper>
            )
        }

        case 'json': {
            return (
                <FieldWrapper label={label}>
                    <JsonMetafield value={metafield.value} />
                </FieldWrapper>
            )
        }

        case 'rich_text_field':
            return (
                <FieldWrapper label={label}>
                    <RichTextFieldMetafield value={metafield.value} />
                </FieldWrapper>
            )

        case 'weight':
        case 'volume':
        case 'dimension': {
            return (
                <FieldWrapper label={label}>
                    <DimensionMetafield value={metafield.value} />
                </FieldWrapper>
            )
        }

        case 'rating': {
            return (
                <FieldWrapper label={label}>
                    <RatingMetafield value={metafield.value} />
                </FieldWrapper>
            )
        }

        case 'money': {
            return (
                <FieldWrapper label={label}>
                    <MoneyMetafield value={metafield} />
                </FieldWrapper>
            )
        }

        case 'list.single_line_text_field':
        case 'list.variant_reference':
        case 'list.file_reference':
        case 'list.metaobject_reference':
        case 'list.mixed_reference':
        case 'list.number_decimal':
        case 'list.number_integer': {
            return (
                <FieldWrapper label={label}>
                    {metafield.value.map((value, index) => {
                        return (
                            <FieldWithCopyButton
                                value={String(value)}
                                key={index}
                                tooltip={
                                    metafield.type ===
                                    'list.single_line_text_field'
                                }
                            />
                        )
                    })}
                </FieldWrapper>
            )
        }

        case 'list.date': {
            return (
                <FieldWrapper label={label}>
                    {metafield.value.map((value, index) => {
                        return <DateMetafield value={value} key={index} />
                    })}
                </FieldWrapper>
            )
        }

        case 'list.date_time': {
            return (
                <FieldWrapper label={label}>
                    {metafield.value.map((value, index) => {
                        return <DateTimeMetafield value={value} key={index} />
                    })}
                </FieldWrapper>
            )
        }

        case 'list.product_reference':
        case 'list.collection_reference':
        case 'list.page_reference': {
            return (
                <FieldWrapper label={label}>
                    {metafield.value.map((value, index) => {
                        return (
                            <ReferenceMetafield
                                value={value}
                                type={metafield.type}
                                key={index}
                            />
                        )
                    })}
                </FieldWrapper>
            )
        }

        case 'list.url': {
            return (
                <FieldWrapper label={label}>
                    {metafield.value.map((value, index) => {
                        return <UrlMetafield value={value} key={index} />
                    })}
                </FieldWrapper>
            )
        }

        case 'list.color': {
            return (
                <FieldWrapper label={label}>
                    {metafield.value.map((value, index) => {
                        return <ColorMetafield value={value} key={index} />
                    })}
                </FieldWrapper>
            )
        }

        case 'list.weight':
        case 'list.volume':
        case 'list.dimension': {
            return (
                <FieldWrapper label={label}>
                    {metafield.value.map((value, index) => {
                        return <DimensionMetafield value={value} key={index} />
                    })}
                </FieldWrapper>
            )
        }

        case 'list.rating': {
            return (
                <FieldWrapper label={label}>
                    {metafield.value.map((value, index) => {
                        return <RatingMetafield value={value} key={index} />
                    })}
                </FieldWrapper>
            )
        }

        default: {
            return <></>
        }
    }
}

type MetafieldProps = {
    value: string
}

function UrlMetafield({value}: MetafieldProps) {
    return (
        <FieldWithCopyButton value={value}>
            <a href={value} target="_blank" rel="noreferrer">
                {shortenUrl(value)}
            </a>
        </FieldWithCopyButton>
    )
}

function DateMetafield({value}: MetafieldProps) {
    return (
        <FieldWithCopyButton value={value}>
            <DatetimeLabel
                dateTime={value}
                hasTooltip={false}
                labelFormat={DateAndTimeFormatting.ShortDateWithYear}
            />
        </FieldWithCopyButton>
    )
}

function DateTimeMetafield({value}: MetafieldProps) {
    return (
        <FieldWithCopyButton value={value}>
            <DatetimeLabel
                dateTime={value}
                hasTooltip={false}
                labelFormat={DateAndTimeFormatting.ShortDateWithYear}
            />
            {' ('}
            <DatetimeLabel
                dateTime={value}
                hasTooltip={false}
                labelFormat={DateAndTimeFormatting.TimeDoubleDigitHour}
            />
            {')'}
        </FieldWithCopyButton>
    )
}

function BooleanMetafield({value}: {value: boolean}) {
    const text = value ? 'true' : 'false'
    const color = value ? 'accessoryGreen' : 'accessoryRed'
    return (
        <FieldWithCopyButton value={text}>
            <Badge label={text} color={color} className={css.badge} />
        </FieldWithCopyButton>
    )
}

function DimensionMetafield({
    value,
}: {
    value:
        | DimensionShopifyMetafieldData
        | VolumeShopifyMetafieldData
        | WeightShopifyMetafieldData
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

function RatingMetafield({value}: {value: RatingShopifyMetafieldData}) {
    const copiableValue = `${value.value} out of ${value.scale_max}`
    return <FieldWithCopyButton value={copiableValue} />
}

function MoneyMetafield({value}: {value: MoneyShopifyMetafield}) {
    const copiableValue = `${value.value.amount} ${value.value.currency_code}`
    return (
        <FieldWithCopyButton value={copiableValue}>
            <MoneyAmount
                renderIfZero
                amount={copiableValue}
                currencyCode={value.value.currency_code}
            />
        </FieldWithCopyButton>
    )
}

function ColorMetafield({value}: MetafieldProps) {
    return (
        <FieldWithCopyButton value={value}>
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
        </FieldWithCopyButton>
    )
}

function ReferenceMetafield({
    value,
    type,
}: {
    value: string
    type: ShopifyMetafieldType
}) {
    const integrationContext = useContext(IntegrationContext)
    const gid = extractGid(value)
    const storeName = integrationContext?.integration?.get('name')
    if (storeName && gid) {
        const url = prepareGidUrl(type, storeName as string, gid)
        return url ? (
            <FieldWithCopyButton value={gid}>
                <a href={url} target="_blank" rel="noreferrer">
                    {gid}
                </a>
            </FieldWithCopyButton>
        ) : null
    }
    return null
}

function RichTextFieldMetafield({value}: {value: Record<string, unknown>}) {
    const render = (node: Record<string, unknown>): string => {
        if ('type' in node && 'value' in node && node.type === 'text') {
            return String(node.value)
        }

        if (isArray(node.children)) {
            return map(node.children, render).join(' ')
        }

        return ''
    }
    const compactValue = render(value)

    return <FieldWithCopyButton value={compactValue} tooltip={true} />
}

function JsonMetafield({value}: {value: Record<string, unknown>}) {
    const formattedJson = JSON.stringify(value, null, 4)
    return <FieldWithCopyButton value={formattedJson} tooltip={true} />
}

function FieldWithCopyButton({
    value,
    children,
    tooltip,
}: {
    value: string
    children?: React.ReactNode
    tooltip?: boolean
}) {
    const ref = createRef<HTMLDivElement>()
    const shortenedValue = truncate(value, {length: 80})
    const isTrimmed = value.length > 80
    return (
        <>
            <div className={css.field} ref={ref}>
                {children ?? shortenedValue}
                <span className={css.copyButton}>
                    <CopyButton value={value} />
                </span>
            </div>
            {isTrimmed && tooltip && (
                <Tooltip target={ref} placement="top">
                    <pre className={css.tooltip}>{value}</pre>
                </Tooltip>
            )}
        </>
    )
}

function FieldWrapper({
    label,
    children,
}: {
    label: string
    children: React.ReactNode
}) {
    return (
        <div className={css.fieldWrapper}>
            <StaticField label={startCase(label)}>{children}</StaticField>
        </div>
    )
}
