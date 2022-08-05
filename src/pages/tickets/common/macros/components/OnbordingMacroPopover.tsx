import React, {
    ReactElement,
    useState,
    useRef,
    ComponentProps,
    MutableRefObject,
    useEffect,
} from 'react'
import {useLocalStorage, useClickAway} from 'react-use'
import {Popover, PopoverBody} from 'reactstrap'
import classnames from 'classnames'
import Button from 'pages/common/components/button/Button'
import {GroupPositionContext} from 'pages/common/components/layout/Group'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {getPreferences, getCurrentUser} from 'state/currentUser/selectors'
import {getTicket} from 'state/ticket/selectors'
import {submitSetting} from 'state/currentUser/actions'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import css from './OnbordingMacroPopover.less'

type Stages = 'info' | 'prompt'
type ButtonProps = {
    label: string
    onClick: () => void
    buttonsProp?: ComponentProps<typeof Button>
}
interface StageProp {
    content: ReactElement
    buttons: Array<ButtonProps>
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

    const [closedCount, setClosedCount] = useLocalStorage(
        'default-macro-popover-closed',
        0
    )

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
        }
    }, [macrosVisible, currentUserPreferences, ticket])

    const setShowMacroByDefault = async (showMacro?: boolean) => {
        setShowPopover(false)
        let updatedCurrentUserPreferences = currentUserPreferences.setIn(
            ['data', 'macros_default_to_search_popover'],
            false
        )

        if (showMacro !== undefined) {
            updatedCurrentUserPreferences = updatedCurrentUserPreferences.setIn(
                ['data', 'show_macros'],
                showMacro
            )
        }
        await dispatch(
            submitSetting(updatedCurrentUserPreferences.toJS(), false)
        )
    }

    const handleClose = async () => {
        setShowPopover(false)
        const nextClosedCount = closedCount === undefined ? 0 : closedCount + 1
        setClosedCount(nextClosedCount)

        if (nextClosedCount >= 3) {
            await setShowMacroByDefault()
        }
    }

    const handleKeepSearch = async () => {
        await setShowMacroByDefault()
    }

    const handleRevertBack = async () => {
        onClearMacro()
        await setShowMacroByDefault(false)
        logEvent(SegmentEvent.MacroRevertDefaultMacroToSearch, {
            user_id: currentUser.get('id'),
        })
    }

    const popoverData: Record<Stages, StageProp> = {
        info: {
            content: (
                <p>
                    You're currently in the macro search view. You can switch to
                    the text editor here.
                </p>
            ),
            buttons: [
                {
                    label: 'Got it',
                    onClick: () => setStage('prompt'),
                    buttonsProp: {intent: 'secondary', fillStyle: 'fill'},
                },
            ],
        },
        prompt: {
            content: (
                <p>
                    You're now defaulted to the macro search view to optimize
                    your workflow.
                </p>
            ),
            buttons: [
                {
                    label: 'Keep search',
                    onClick: handleKeepSearch,
                    buttonsProp: {intent: 'primary'},
                },
                {
                    label: 'Revert back',
                    onClick: handleRevertBack,
                    buttonsProp: {intent: 'secondary'},
                },
            ],
        },
    }

    return (
        <>
            {showPopover && (
                <MacroPopOver
                    target={target}
                    onClose={handleClose}
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
    onClose,
}: {
    onClose: () => void
    content: ReactElement
    buttons: Array<ButtonProps>
    target: MutableRefObject<HTMLElement | null>
}) {
    const popoverBodyRef = useRef(null)

    useClickAway(popoverBodyRef, () => {
        if (buttons.every((button) => button.label !== 'Got it')) {
            onClose()
        }
    })

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
                >
                    <div ref={popoverBodyRef}>
                        <PopoverBody>
                            <div
                                className={classnames(
                                    'd-md-block p-1',
                                    css.popoverContent
                                )}
                            >
                                {content}
                            </div>
                            <GroupPositionContext.Provider value={null}>
                                {buttons.map((button) => {
                                    return (
                                        <Button
                                            {...button.buttonsProp}
                                            className="mx-1"
                                            onClick={button.onClick}
                                            key={button.label}
                                        >
                                            {button.label}
                                        </Button>
                                    )
                                })}
                            </GroupPositionContext.Provider>
                        </PopoverBody>
                    </div>
                </Popover>
            )}
        </>
    )
}
