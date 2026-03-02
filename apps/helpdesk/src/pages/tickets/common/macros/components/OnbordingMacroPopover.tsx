import type { MutableRefObject, ReactElement } from 'react'
import React, { useEffect, useRef, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import classnames from 'classnames'
import { Link } from 'react-router-dom'
import { Popover, PopoverBody } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'
import type { LegacyButtonComponentProps as ButtonComponentProps } from '@gorgias/axiom'

import { useAppNode } from 'appNode'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { submitSetting } from 'state/currentUser/actions'
import { getCurrentUser, getPreferences } from 'state/currentUser/selectors'
import { getTicket } from 'state/ticket/selectors'

import css from './OnbordingMacroPopover.less'

type Stages = 'info' | 'prompt'
type ButtonsProps = {
    label: string
    onClick: () => void
    buttonsProp?: Omit<ButtonComponentProps, 'children'>
}
interface StageProp {
    content: ReactElement
    buttons: Array<ButtonsProps>
}

interface Props {
    macrosVisible: boolean
    onClearMacro: () => void
    target: MutableRefObject<HTMLElement | null>
}

export default function OnbordingMacroPopover({
    target,
    onClearMacro,
    macrosVisible,
}: Props) {
    const dispatch = useAppDispatch()
    const [stage, setStage] = useState<Stages>('info')
    const [showPopover, setShowPopover] = useState(false)
    const hasShownPopover = useRef(false)
    const ticket = useAppSelector(getTicket)
    const currentUser = useAppSelector(getCurrentUser)

    const currentUserPreferences = useAppSelector(getPreferences)

    useEffect(() => {
        const showMacrosSetting: undefined | boolean =
            currentUserPreferences.getIn(['data', 'show_macros'])

        const showPopoverSetting: undefined | boolean =
            currentUserPreferences.getIn([
                'data',
                'macros_default_to_search_popover',
            ])

        if (
            macrosVisible &&
            showPopoverSetting &&
            showMacrosSetting &&
            ticket.channel === 'email' &&
            !hasShownPopover.current
        ) {
            setShowPopover(() => {
                hasShownPopover.current = true
                return true
            })
            logEvent(SegmentEvent.MacroDefaultMacroToSearch, {
                action: 'show popover',
                user_id: currentUser.get('id'),
            })
        }
    }, [macrosVisible, currentUserPreferences, ticket, currentUser])

    const setShowMacroByDefault = async (showMacro?: boolean) => {
        setShowPopover(false)
        let updatedCurrentUserPreferences = currentUserPreferences.setIn(
            ['data', 'macros_default_to_search_popover'],
            false,
        )

        if (showMacro !== undefined) {
            updatedCurrentUserPreferences = updatedCurrentUserPreferences.setIn(
                ['data', 'show_macros'],
                showMacro,
            )
        }
        await dispatch(
            submitSetting(updatedCurrentUserPreferences.toJS(), false),
        )
    }

    const handleKeepSearch = async () => {
        await setShowMacroByDefault()
        logEvent(SegmentEvent.MacroDefaultMacroToSearch, {
            action: 'keep search',
            user_id: currentUser.get('id'),
        })
    }

    const handleRevertBack = async () => {
        onClearMacro()
        await setShowMacroByDefault(false)
        logEvent(SegmentEvent.MacroDefaultMacroToSearch, {
            action: 'revert back',
            user_id: currentUser.get('id'),
        })
    }

    const popoverData: Record<Stages, StageProp> = {
        info: {
            content: (
                <p>
                    You’re currently in the macro search view. You can change
                    this in your{' '}
                    <Link to={'/app/settings/profile'}>macro preferences</Link>.
                </p>
            ),
            buttons: [
                {
                    label: 'Got it',
                    onClick: () => setStage('prompt'),
                    buttonsProp: { intent: 'secondary', fillStyle: 'fill' },
                },
            ],
        },
        prompt: {
            content: (
                <p>
                    You’re now defaulted to the macro search view to optimize
                    your workflow. You can change this in your{' '}
                    <Link to={'/app/settings/profile'}>macro preferences</Link>.
                </p>
            ),
            buttons: [
                {
                    label: 'Keep search',
                    onClick: handleKeepSearch,
                    buttonsProp: { intent: 'primary' },
                },
                {
                    label: 'Revert back',
                    onClick: handleRevertBack,
                    buttonsProp: { intent: 'secondary' },
                },
            ],
        },
    }

    return (
        <>
            {showPopover && (
                <MacroPopOver
                    target={target}
                    content={popoverData[stage].content}
                    buttons={popoverData[stage].buttons}
                />
            )}
        </>
    )
}

function MacroPopOver({
    content,
    buttons,
    target,
}: {
    content: ReactElement
    buttons: Array<ButtonsProps>
    target: MutableRefObject<HTMLElement | null>
}) {
    const popoverBodyRef = useRef(null)
    const appNode = useAppNode()

    return (
        <>
            {target && (
                <Popover
                    target={target}
                    isOpen={true}
                    placement="top-start"
                    onClick={(event) => {
                        event.stopPropagation()
                    }}
                    trigger="legacy"
                    container={appNode ?? undefined}
                >
                    {({ scheduleUpdate }) => {
                        // React-Virtuoso is preventing Popperjs initial update
                        scheduleUpdate()
                        return (
                            <div ref={popoverBodyRef}>
                                <PopoverBody>
                                    <div
                                        className={classnames(
                                            'd-md-block p-1',
                                            css.popoverContent,
                                        )}
                                    >
                                        {content}
                                    </div>
                                    {buttons.map((button) => {
                                        return (
                                            <Button
                                                key={button.label}
                                                {...button.buttonsProp}
                                                className="mx-1"
                                                onClick={button.onClick}
                                            >
                                                {button.label}
                                            </Button>
                                        )
                                    })}
                                </PopoverBody>
                            </div>
                        )
                    }}
                </Popover>
            )}
        </>
    )
}
