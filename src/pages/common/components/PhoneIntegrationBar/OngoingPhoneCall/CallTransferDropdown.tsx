import React, {ComponentProps, useState} from 'react'
import useAppSelector from 'hooks/useAppSelector'
import {getAgentsJS} from 'state/agents/selectors'
import Dropdown from '../../dropdown/Dropdown'
import DropdownBody from '../../dropdown/DropdownBody'
import DropdownSearch from '../../dropdown/DropdownSearch'
import DropdownItem from '../../dropdown/DropdownItem'
import Button from '../../button/Button'

import DropdownSection from '../../dropdown/DropdownSection'
import css from './CallTransferDropdown.less'

type Props = Pick<
    ComponentProps<typeof Dropdown>,
    'isOpen' | 'onToggle' | 'target' | 'placement'
>

export default function CallTransferDropdown({
    isOpen,
    onToggle,
    target,
    placement = 'top',
}: Props) {
    const agents = useAppSelector(getAgentsJS)
    const [, setSelectedAgent] = useState<number | null>(null)

    return (
        <Dropdown
            isOpen={isOpen}
            onToggle={onToggle}
            target={target}
            placement={placement}
            className={css.container}
        >
            <DropdownSearch />
            <DropdownBody className={css.dropdownBody}>
                <DropdownSection title="Agents">
                    {agents.map((option) => (
                        <DropdownItem
                            key={`agent-${option.id}`}
                            option={{
                                label: `${option.name}`,
                                value: option.id,
                            }}
                            onClick={setSelectedAgent}
                        />
                    ))}
                </DropdownSection>
            </DropdownBody>
            <div className={css.dropdownFooter}>
                <Button className={css.cta}>Transfer call</Button>
            </div>
        </Dropdown>
    )
}
