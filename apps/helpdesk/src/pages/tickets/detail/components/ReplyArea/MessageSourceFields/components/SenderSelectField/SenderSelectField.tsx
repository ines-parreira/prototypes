import React, { useRef, useState } from 'react'

import { useSendersForSelectedChannel } from 'hooks/useOutboundChannels'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import SenderDropDownItem from './SenderDropDownItem'

import css from './SenderSelectField.less'

const SenderSelectField = () => {
    const { selectedSender, senders, selectSender } =
        useSendersForSelectedChannel()

    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)

    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className={css.field}>
            <SelectInputBox
                className={css.wrapper}
                floating={floatingRef}
                label={selectedSender?.displayName}
                onToggle={setIsOpen}
                ref={targetRef}
            >
                <SelectInputBoxContext.Consumer data-testid={`select`}>
                    {(context) => (
                        <Dropdown
                            isOpen={isOpen}
                            onToggle={() =>
                                context ? context.onBlur() : undefined
                            }
                            ref={floatingRef}
                            target={targetRef}
                            value={selectedSender?.address}
                            root={
                                targetRef?.current?.parentElement ?? undefined
                            }
                        >
                            <DropdownBody
                                onMouseDown={(event) => {
                                    // TODO: this is needed to block SelectInputBox onBlur event
                                    //  if clicking on the DropdownBody scrollbar
                                    //  https://linear.app/gorgias/issue/FE-854/check-why-selectinputbox-dropdown-doesnt-allow-click-on-scrollbar
                                    if (
                                        event.target ===
                                        floatingRef.current?.firstElementChild
                                    ) {
                                        event.preventDefault()
                                    }
                                }}
                            >
                                {senders
                                    .sort(
                                        (a, b) =>
                                            Number(a?.isDeactivated) -
                                            Number(b?.isDeactivated),
                                    )
                                    .map((sender) => (
                                        <SenderDropDownItem
                                            key={sender.address}
                                            sender={sender}
                                            onSelect={selectSender}
                                        />
                                    ))}
                            </DropdownBody>
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
        </div>
    )
}

export default SenderSelectField
