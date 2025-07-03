import React, { useCallback, useRef, useState } from 'react'

import { Button } from '@gorgias/merchant-ui-kit'

import { StoreIntegration } from '../../../../models/integration/types'
import Dropdown from '../dropdown/Dropdown'
import DropdownBody from '../dropdown/DropdownBody'
import DropdownItem from '../dropdown/DropdownItem'
import DropdownSearch from '../dropdown/DropdownSearch'
import { IntegrationIcon } from '../IntegrationIcon/IntegrationIcon'

import css from './StoreSelector.less'

type Props = {
    integrations: StoreIntegration[]
    selected?: StoreIntegration
    onChange: (value: number) => void
    withSearch?: boolean
}

export default function StoreSelector({
    integrations,
    selected,
    onChange,
    withSearch = false,
}: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const targetRef = useRef<HTMLButtonElement | null>(null)

    const handleClickButton = useCallback(() => {
        setIsOpen((o) => !o)
    }, [])

    if (!selected) return null

    return (
        <>
            <Button
                intent="secondary"
                ref={targetRef}
                onClick={handleClickButton}
            >
                <span className={css.spacer}>
                    <IntegrationIcon kind={selected.type} />
                    {selected.name || ''}
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
                    {integrations.map((integration) => (
                        <DropdownItem
                            key={integration.id}
                            option={{
                                label: integration.name,
                                value: integration.id,
                            }}
                            onClick={onChange}
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
