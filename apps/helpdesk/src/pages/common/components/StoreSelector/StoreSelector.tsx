import React, { useCallback, useRef, useState } from 'react'

import classNames from 'classnames'

import { Button, Separator } from '@gorgias/merchant-ui-kit'

import { StoreIntegration } from '../../../../models/integration/types'
import Dropdown from '../dropdown/Dropdown'
import DropdownBody from '../dropdown/DropdownBody'
import DropdownItem from '../dropdown/DropdownItem'
import DropdownSearch from '../dropdown/DropdownSearch'
import { IntegrationIcon } from '../IntegrationIcon/IntegrationIcon'

import css from './StoreSelector.less'

type BaseProps = {
    integrations: StoreIntegration[]
    selected?: StoreIntegration | null
    withSearch?: boolean
}

type PropsWithAllOption = BaseProps & {
    withAllOption: true
    onChange: (value: number | null) => void
}

type PropsWithoutAllOption = BaseProps & {
    withAllOption?: false
    onChange: (value: number) => void
}

type Props = PropsWithAllOption | PropsWithoutAllOption

export default function StoreSelector({
    integrations,
    selected,
    onChange,
    withSearch = false,
    withAllOption = false,
}: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const targetRef = useRef<HTMLButtonElement | null>(null)

    const handleClickButton = useCallback(() => {
        setIsOpen((o) => !o)
    }, [])

    if (selected === undefined) return null

    return (
        <>
            <Button
                intent="secondary"
                ref={targetRef}
                onClick={handleClickButton}
            >
                <span className={classNames(css.spacer, css.button)}>
                    {selected && <IntegrationIcon kind={selected.type} />}
                    <span className={css.buttonTextContent}>
                        {selected === null
                            ? 'All Stores'
                            : selected?.name || ''}
                    </span>
                    <i className="material-icons">arrow_drop_down</i>
                </span>
            </Button>
            <Dropdown
                isOpen={isOpen}
                placement="bottom-end"
                target={targetRef}
                onToggle={setIsOpen}
            >
                {withSearch && <DropdownSearch autoFocus />}
                <DropdownBody>
                    {withAllOption && (
                        <>
                            <DropdownItem
                                key="all"
                                option={{
                                    label: 'All Stores',
                                    value: null,
                                }}
                                onClick={() =>
                                    (
                                        onChange as (
                                            value: number | null,
                                        ) => void
                                    )(null)
                                }
                                shouldCloseOnSelect
                                alwaysVisible
                            >
                                <span className={css.spacer}>
                                    <div className={css.fakeIcon} />
                                    All Stores
                                </span>
                            </DropdownItem>
                            <Separator />
                        </>
                    )}
                    {integrations.map((integration) => (
                        <DropdownItem
                            key={integration.id}
                            option={{
                                label: integration.name,
                                value: integration.id,
                            }}
                            onClick={() => onChange(integration.id)}
                            shouldCloseOnSelect
                        >
                            <span className={css.spacer}>
                                <IntegrationIcon kind={integration.type} />
                                {integration.name}
                            </span>
                        </DropdownItem>
                    ))}
                </DropdownBody>
            </Dropdown>
        </>
    )
}
