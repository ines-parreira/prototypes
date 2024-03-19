import React, {ComponentProps, useState} from 'react'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import Button from 'pages/common/components/button/Button'
import {AgentLabel} from 'pages/common/utils/labels'
import {getHumanAgentsJS} from 'state/agents/selectors'
import useAppSelector from 'hooks/useAppSelector'

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
    const agents = useAppSelector(getHumanAgentsJS)
    const [selectedAgent, setSelectedAgent] = useState<number | null>(null)

    return (
        <Dropdown
            isOpen={isOpen}
            onToggle={onToggle}
            target={target}
            placement={placement}
            className={css.container}
            value={selectedAgent}
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
                        >
                            <AgentLabel
                                shouldDisplayAvatar
                                name={option.name}
                                profilePictureUrl={
                                    option.meta?.profile_picture_url
                                }
                            />
                        </DropdownItem>
                    ))}
                </DropdownSection>
            </DropdownBody>
            <div className={css.dropdownFooter}>
                <Button className={css.cta} isDisabled={!selectedAgent}>
                    Transfer call
                </Button>
            </div>
        </Dropdown>
    )
}
