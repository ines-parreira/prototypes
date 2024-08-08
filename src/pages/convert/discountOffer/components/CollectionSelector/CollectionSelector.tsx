import React, {useMemo, useRef, useState} from 'react'

import {useCollectionsFromShopifyIntegration} from 'models/integration/queries'

import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'

import css from './CollectionSelector.less'

type Option = {
    label: string
    value: string | null
}

type Props = {
    integrationId: number
    value: string[] | null
    onChange: (nextValue: string | null) => void
}

const CollectionSelector: React.FC<Props> = ({
    integrationId,
    value,
    onChange,
}) => {
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)

    const [search, setSearch] = useState<string>('')
    const [isSelectOpen, setIsSelectOpen] = useState(false)

    const {data: collectionData} =
        useCollectionsFromShopifyIntegration(integrationId)

    const productCollections = useMemo<Option[]>(() => {
        return (
            collectionData?.map(
                (segment): Option => ({
                    label: segment.title,
                    value: segment.id.toString(),
                })
            ) ?? []
        )
    }, [collectionData])

    const getLabel = () => {
        switch (value?.length) {
            case undefined:
                return ''
            case 0:
                return ''
            case 1:
                return productCollections.find(
                    (item) => item.value === value[0]
                )?.label
            default:
                return `${value?.length} collections selected`
        }
    }

    return (
        <SelectInputBox
            ref={targetRef}
            floating={floatingRef}
            placeholder={'Select a product collection'}
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
                            onChange={setSearch}
                            autoFocus
                        />
                        <DropdownBody>
                            {productCollections.map((segment) => (
                                <DropdownItem
                                    key={segment.value}
                                    option={segment}
                                    onClick={() => onChange(segment.value)}
                                    shouldCloseOnSelect={false}
                                >
                                    <span>{segment.label}</span>
                                </DropdownItem>
                            ))}
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}

export default CollectionSelector
