import React from 'react'
import {FormGroup, InputGroup, Label} from 'reactstrap'

import SelectField from 'pages/common/forms/SelectField/SelectField'
import ProductSelector from 'pages/convert/discountOffer/components/ProductSelector'
import CollectionSelector from '../CollectionSelector'

import css from './CollectionFormGroup.less'

export enum AppliesTypeEnum {
    ORDER_AMOUNT = 'order_amount',
    PRODUCT_COLLECTION = 'specific_collection',
    SPECIFIC_PRODUCT = 'specific_product',
}

type CollectionFormGroupProps = {
    integrationId: number
    selectedCollections: string[] | null
    onSelectedCollectionsChange: (value: string | null) => void
    selectedProducts: string[] | null
    onSelectedProductsChange: (value: string | null) => void
    appliesTo: AppliesTypeEnum
    setAppliesTo: (value: AppliesTypeEnum) => void
}

export const CollectionFormGroup: React.FC<CollectionFormGroupProps> = (
    props
) => {
    return (
        <FormGroup>
            <Label htmlFor="applies-to" className={css.label}>
                Applies to
            </Label>
            <InputGroup className={css.inputGroup}>
                <div className={css.inputChild}>
                    <SelectField
                        id="applies-to"
                        showSelectedOption
                        fullWidth
                        value={props.appliesTo}
                        options={[
                            {
                                label: 'Total order amount',
                                value: AppliesTypeEnum.ORDER_AMOUNT,
                            },
                            {
                                label: 'To specific collection',
                                value: AppliesTypeEnum.PRODUCT_COLLECTION,
                            },
                            {
                                label: 'To specific products',
                                value: AppliesTypeEnum.SPECIFIC_PRODUCT,
                            },
                        ]}
                        onChange={(value) =>
                            props.setAppliesTo(value as AppliesTypeEnum)
                        }
                    />
                </div>
            </InputGroup>
            {props.appliesTo === AppliesTypeEnum.PRODUCT_COLLECTION && (
                <div className={css.itemsSelector}>
                    <CollectionSelector
                        value={props.selectedCollections}
                        integrationId={props.integrationId}
                        onChange={(value) =>
                            props.onSelectedCollectionsChange(value as string)
                        }
                    />
                </div>
            )}
            {props.appliesTo === AppliesTypeEnum.SPECIFIC_PRODUCT && (
                <div className={css.itemsSelector}>
                    <ProductSelector
                        value={props.selectedProducts}
                        integrationId={props.integrationId}
                        onChange={props.onSelectedProductsChange}
                    />
                </div>
            )}
        </FormGroup>
    )
}
