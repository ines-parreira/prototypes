import React from 'react'
import {FormGroup, InputGroup, Label} from 'reactstrap'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import CollectionSelector from '../CollectionSelector'

import css from './CollectionFormGroup.less'

export enum AppliesTypeEnum {
    ORDER_AMOUNT = 'order_amount',
    PRODUCT_COLLECTION = 'specific_collection',
}

type CollectionFormGroupProps = {
    integrationId: number
    selected: string[] | null
    onSelectionChange: (value: string | null) => void
    appliesTo: AppliesTypeEnum
    setAppliesTo: (value: AppliesTypeEnum) => void
}

export const CollectionFormGroup: React.FC<CollectionFormGroupProps> = (
    props
) => {
    return (
        <FormGroup>
            <div data-testid={'appliesTo'}>
                <Label htmlFor="appliesTo" className={css.label}>
                    Applies to
                </Label>
                <InputGroup className={css.inputGroup}>
                    <div className={css.inputChild}>
                        <SelectField
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
                            ]}
                            onChange={(value) =>
                                props.setAppliesTo(value as AppliesTypeEnum)
                            }
                        />
                    </div>
                </InputGroup>
                {props.appliesTo === AppliesTypeEnum.PRODUCT_COLLECTION && (
                    <div className={css.collectionSelector}>
                        <CollectionSelector
                            value={props.selected}
                            integrationId={props.integrationId}
                            onChange={(value) =>
                                props.onSelectionChange(value as string)
                            }
                        />
                    </div>
                )}
            </div>
        </FormGroup>
    )
}
