import React, { useCallback, useRef, useState } from 'react'

import { Button } from '@gorgias/merchant-ui-kit'

import { StoreIntegration } from 'models/integration/types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import { IntegrationIcon } from './IntegrationIcon'

import css from './StoreSelector.less'

type Props = {
    integrations: StoreIntegration[]
    selected?: StoreIntegration
    onChange: (value: number) => void
}

export function StoreSelector({ integrations, selected, onChange }: Props) {
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
