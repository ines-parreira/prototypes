import type { ReactNode } from 'react'

import type { ShopifyMetafield } from '@gorgias/helpdesk-queries'

import {
    BooleanMetafield,
    ColorMetafield,
    DateMetafield,
    DateTimeMetafield,
    DimensionMetafield,
    FieldWithCopyButton,
    FieldWrapper,
    JsonMetafield,
    MoneyMetafield,
    RatingMetafield,
    ReferenceMetafield,
    RichTextFieldMetafield,
    UrlMetafield,
} from './MetafieldFields'
import { TextFieldMetafield } from './TextFieldMetafield'

export type ExtendedShopifyMetafield = ShopifyMetafield & {
    owner_resource: string
}

export type Props = {
    metafield: ShopifyMetafield
}

export default function Metafield({ metafield }: Props) {
    const label = metafield.key || ''

    const renderField = (content: ReactNode) => (
        <FieldWrapper label={label}>{content}</FieldWrapper>
    )

    const renderListItems = <T,>(
        values: T[],
        Component: (props: { value: T; key: number }) => JSX.Element,
    ) =>
        renderField(
            values.map((value, index) => (
                <Component value={value} key={index} />
            )),
        )

    switch (metafield.type) {
        case 'multi_line_text_field':
        case 'single_line_text_field':
            return renderField(
                <TextFieldMetafield
                    metafield={metafield as ExtendedShopifyMetafield}
                />,
            )

        case 'variant_reference':
        case 'file_reference':
        case 'metaobject_reference':
        case 'mixed_reference':
        case 'number_decimal':
        case 'number_integer':
            return renderField(
                <FieldWithCopyButton value={String(metafield.value)} />,
            )

        case 'date':
            return renderField(<DateMetafield value={metafield.value} />)

        case 'date_time':
            return renderField(<DateTimeMetafield value={metafield.value} />)

        case 'boolean':
            return renderField(<BooleanMetafield value={metafield.value} />)

        case 'product_reference':
        case 'collection_reference':
        case 'page_reference':
            return renderField(
                <ReferenceMetafield
                    value={metafield.value}
                    type={metafield.type}
                />,
            )

        case 'url':
            return renderField(<UrlMetafield value={metafield.value} />)

        case 'color':
            return renderField(<ColorMetafield value={metafield.value} />)

        case 'json':
            return renderField(<JsonMetafield value={metafield.value} />)

        case 'rich_text_field':
            return renderField(
                <RichTextFieldMetafield value={metafield.value} />,
            )

        case 'weight':
        case 'volume':
        case 'dimension':
            return renderField(<DimensionMetafield value={metafield.value} />)

        case 'rating':
            return renderField(<RatingMetafield value={metafield.value} />)

        case 'money':
            return renderField(<MoneyMetafield value={metafield} />)

        case 'list.single_line_text_field':
        case 'list.variant_reference':
        case 'list.file_reference':
        case 'list.metaobject_reference':
        case 'list.mixed_reference':
        case 'list.number_decimal':
        case 'list.number_integer':
            return renderField(
                metafield.value.map((value, index) => (
                    <FieldWithCopyButton
                        value={String(value)}
                        key={index}
                        tooltip={
                            metafield.type === 'list.single_line_text_field'
                        }
                    />
                )),
            )

        case 'list.date':
            return renderListItems(metafield.value, DateMetafield)

        case 'list.date_time':
            return renderListItems(metafield.value, DateTimeMetafield)

        case 'list.product_reference':
        case 'list.collection_reference':
        case 'list.page_reference':
            return renderField(
                metafield.value.map((value, index) => (
                    <ReferenceMetafield
                        value={value}
                        type={metafield.type}
                        key={index}
                    />
                )),
            )

        case 'list.url':
            return renderListItems(metafield.value, UrlMetafield)

        case 'list.color':
            return renderListItems(metafield.value, ColorMetafield)

        case 'list.weight':
        case 'list.volume':
        case 'list.dimension':
            return renderListItems(metafield.value, DimensionMetafield)

        case 'list.rating':
            return renderListItems(metafield.value, RatingMetafield)

        default:
            return <></>
    }
}
