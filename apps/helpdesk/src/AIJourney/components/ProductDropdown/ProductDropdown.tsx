import { useEffect, useState } from 'react'

import classNames from 'classnames'

import { Product } from 'constants/integrations/types/shopify'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { ProductDisplayer } from './components/ProductDisplayer'

import css from './ProductDropdown.less'

type ProductDropdownProps = {
    options: Product[]
    onChange?: (option: Product) => void
}

export const ProductDropdown = ({
    options,
    onChange,
}: ProductDropdownProps) => {
    const dispatch = useAppDispatch()

    const [isOpen, setIsOpen] = useState(false)
    const [selectedOption, setSelectedOption] = useState<Product>(options[0])

    useEffect(() => {
        if (options.length > 0 && !selectedOption) {
            onChange?.(options[0])
        }
    }, [options, selectedOption, onChange])

    const productDropdownOptionsClass = classNames(css.productDropdownOptions, {
        [css['productDropdownOptions--open']]: isOpen,
    })

    const handleOptionChange = (optionId: number) => {
        const selectedProduct = options.find((op) => op?.id === optionId)

        if (selectedProduct) {
            setSelectedOption(selectedProduct)
            setIsOpen(false)
            if (onChange) {
                onChange(selectedProduct)
            }
        } else {
            void dispatch(
                notify({
                    message: `Invalid selectedProduct \nProduct data: ${selectedProduct}`,
                    status: NotificationStatus.Error,
                }),
            )
            console.error(
                `Invalid selectedProduct \nProduct data: ${selectedProduct}`,
            )
        }
    }

    return (
        <div
            className={css.selector}
            role="group"
            tabIndex={0}
            onBlur={() => setIsOpen(false)}
        >
            <div
                className={css.productDropdownSelect}
                onClick={() => setIsOpen(!isOpen)}
            >
                <ProductDisplayer
                    variantTitle={selectedOption?.variants[0]?.title}
                    title={selectedOption?.title}
                    image={selectedOption?.image?.src}
                />
                <i
                    className={classNames(
                        'material-icons-outlined',
                        css.dropdownArrow,
                    )}
                >
                    keyboard_arrow_down
                </i>
            </div>
            <ul className={productDropdownOptionsClass} role="listbox">
                {options.map(({ variants, id, title, image }) => (
                    <ProductDisplayer
                        variantTitle={variants[0]?.title}
                        title={title}
                        image={image?.src}
                        isSelected={selectedOption?.id === id}
                        onClick={() => handleOptionChange(id)}
                        key={id}
                    />
                ))}
            </ul>
        </div>
    )
}
