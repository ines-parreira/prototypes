import _debounce from 'lodash/debounce'
import React, {useCallback, useMemo, useRef, useState} from 'react'

import {useProductsFromShopifyIntegration} from 'models/integration/queries'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import css from 'pages/convert/discountOffer/components/ProductSelector/ProductSelector.less'

type Option = {
    label: string
    value: string | null
}

type Props = {
    integrationId: number
    value: string[] | null
    onChange: (nextValue: string | null) => void
}

const ProductSelector: React.FC<Props> = ({integrationId, value, onChange}) => {
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)

    const [search, setSearch] = useState<string>('')
    const [isSelectOpen, setIsSelectOpen] = useState(false)

    const {data: productsData} = useProductsFromShopifyIntegration(
        integrationId,
        search
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debounceOnSearchChange = useCallback(
        _debounce((value: string) => {
            setSearch(value)
        }, 250),
        [setSearch]
    )

    const products = useMemo<Option[]>(() => {
        return (
            productsData?.map(
                (product): Option => ({
                    label: product.data.title,
                    value: product.data.id.toString(),
                })
            ) ?? []
        )
    }, [productsData])

    const getLabel = () => {
        switch (value?.length) {
            case undefined:
            case 0:
                return ''
            case 1:
                return products.find((item) => item.value === value[0])?.label
            default:
                return `${value?.length} products selected`
        }
    }

    return (
        <SelectInputBox
            ref={targetRef}
            floating={floatingRef}
            placeholder={'Select specific products'}
            onToggle={setIsSelectOpen}
            className={css.selectInput}
            label={getLabel()}
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        isOpen={isSelectOpen}
                        onToggle={() => context!.onBlur()}
                        ref={floatingRef}
                        target={targetRef}
                        value={value}
                        isMultiple={true}
                    >
                        <DropdownSearch
                            ref={searchRef}
                            value={search}
                            onChange={debounceOnSearchChange}
                            autoFocus
                        />
                        <DropdownBody>
                            {products.map((product) => (
                                <DropdownItem
                                    key={product.value}
                                    option={product}
                                    onClick={() => onChange(product.value)}
                                    shouldCloseOnSelect={false}
                                >
                                    <span>{product.label}</span>
                                </DropdownItem>
                            ))}
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}

export default ProductSelector
