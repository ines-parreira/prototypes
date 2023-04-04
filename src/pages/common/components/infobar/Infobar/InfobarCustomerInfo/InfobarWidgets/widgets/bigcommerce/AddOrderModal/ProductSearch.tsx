import React, {useState} from 'react'
import classnames from 'classnames'
import {DropdownItem} from 'reactstrap'
import searchInputCss from 'pages/common/forms/SearchInput/SearchInput.less'
import {
    BigCommerceCustomProduct,
    BigCommerceProduct,
    BigCommerceProductVariant,
    CreateOrderValidationResult,
    IntegrationDataItem,
} from 'models/integration/types'
import {bigcommerceDataMappers} from 'pages/common/forms/ProductSearchInput/Mappings'
import ProductSearchInput from 'pages/common/forms/ProductSearchInput/ProductSearchInput'
import {AddCustomProductPopover} from './AddCustomProductPopover'

import css from './OrderModal.less'

export const ProductSearch = ({
    currency,
    validationStatus,
    onVariantClicked,
    onAddCustomProduct,
}: {
    currency: string
    validationStatus: CreateOrderValidationResult
    onVariantClicked: (
        item: IntegrationDataItem<BigCommerceProduct>,
        variant: BigCommerceProductVariant
    ) => void
    onAddCustomProduct: (customItem: BigCommerceCustomProduct) => void
}) => {
    const [isPopoverOpen, setPopoverOpen] = useState(false)

    return (
        <div className={css.flex}>
            <ProductSearchInput
                className={classnames(css.searchInput, {
                    [css.disabled]: !currency,
                })}
                hasError={!validationStatus.products}
                dataMappers={bigcommerceDataMappers}
                searchOnFocus={true}
                renderResultsAppendix={({onMouseOver, onMouseClick}) => (
                    <DropdownItem
                        onMouseOver={onMouseOver}
                        onClick={() => {
                            onMouseClick()
                            setPopoverOpen(true)
                        }}
                        className={classnames(searchInputCss.dropdownItem, {
                            [searchInputCss.addCustomResultDropdownItem]: true,
                        })}
                        toggle={false}
                    >
                        + Add custom product
                    </DropdownItem>
                )}
                renderResultItemProps={(props) => {
                    const {disabled, disabledReason} =
                        bigcommerceDataMappers.product(props.result)

                    return {disabled, disabledReason}
                }}
                onVariantClicked={onVariantClicked}
            />
            <AddCustomProductPopover
                id="bigcommerce-add-custom-product-btn"
                currencyCode={currency}
                isOpen={isPopoverOpen}
                onOpen={() => setPopoverOpen(true)}
                onClose={() => setPopoverOpen(false)}
                onAddCustomProduct={onAddCustomProduct}
            />
        </div>
    )
}
