import classNames from 'classnames'
import React, {useRef, useState} from 'react'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import {supportedLanguages} from '../models/workflowConfiguration.types'
import css from './WorkflowLanguageSelect.less'

type Props = {
    selected: string
    channels: string[]
    onSelect: (channel: string) => void
}

export default function ChatChannelSelector({
    selected,
    channels,
    onSelect,
}: Props) {
    const [isSelectOpen, setIsSelectOpen] = useState(false)
    const targetRef = useRef<HTMLDivElement>(null)

    return (
        <>
            <div
                ref={targetRef}
                onClick={() => setIsSelectOpen((v) => !v)}
                className={css.select}
            >
                <div className={css.grow}>
                    {
                        supportedLanguages.find(({code}) => code === selected)
                            ?.label
                    }
                    <i className={classNames('material-icons', css.arrowDown)}>
                        forum
                    </i>
                </div>
                <i className={classNames('material-icons', css.arrowDown)}>
                    arrow_drop_down
                </i>
            </div>
            <Dropdown
                isOpen={isSelectOpen}
                onToggle={setIsSelectOpen}
                target={targetRef}
                value={selected}
            >
                <DropdownBody className={css.dropdownBody}>
                    {channels.map((channel) => (
                        <DropdownItem
                            key={channel}
                            option={{
                                label: channel,
                                value: channel,
                            }}
                            onClick={(value) => {
                                onSelect(value)
                            }}
                            shouldCloseOnSelect
                        >
                            <div className={css.dropdownItem}>
                                <div className={css.grow}>{channel}</div>
                            </div>
                        </DropdownItem>
                    ))}
                </DropdownBody>
            </Dropdown>
        </>
    )
}
