import React, {
    memo,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    useRef,
} from 'react'
import {useSelector} from 'react-redux'
import {
    UncontrolledDropdown,
    DropdownMenu,
    DropdownToggle,
    Modal,
} from 'reactstrap'
import {Map} from 'immutable'
import {useDebounce} from 'react-use'

import classnames from 'classnames'
import Group from 'pages/common/components/layout/Group'
import GroupItem from 'pages/common/components/layout/GroupItem'
import IconButton from 'pages/common/components/button/IconButton'
import {ButtonIntent} from 'pages/common/components/button/Button'
import {renderTemplate} from 'pages/common/utils/template'
import {getTicket} from 'state/ticket/selectors'
import {getActiveCustomer} from 'state/customers/selectors'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {IntegrationContext} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/IntegrationContext'
import {
    Action,
    Button as ButtonType,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import css from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/ActionButtons/ActionButtons.less'
import Button from './Button'
import ActionEditor from './ActionEditor'

const NB_MIN_BUTTON_DISPLAYED = 2
const FONT_SIZE = 14
const BUTTON_SPACING = 22
const SHOW_MORE_WIDTH = 31

type Props = {
    buttons: ButtonType[]
    source: Map<string, unknown>
}

type HandleSubmit = (action: Action) => void

function ButtonsGroup({buttons, source}: Props) {
    // templating management
    const ticket = useSelector(getTicket)
    const user = useSelector(getActiveCustomer)
    const templateContext = useMemo(() => {
        return {
            ...(source.toJS() as Record<string, unknown>),
            ticket,
            user,
        }
    }, [user, source, ticket])

    // editor management
    const currentAccount = useSelector(getCurrentAccountState)
    const {integrationId} = useContext(IntegrationContext)
    const [editIndex, setEditIndex] = useState<number>(0)
    const [isEditorOpen, setEditorOpen] = useState<boolean>(false)
    const [handleSubmit, setHandleSubmit] = useState<HandleSubmit>()
    const openEditor = useCallback((index: number, callback: HandleSubmit) => {
        setEditIndex(index)
        setEditorOpen(true)
        setHandleSubmit(() => callback)
    }, [])
    const handleCloseEditor = useCallback(
        (doTrack: boolean | React.MouseEvent = true) => {
            if (!!doTrack) {
                logEvent(SegmentEvent.CustomActionButtonsParamClosed, {
                    account_domain: currentAccount.get('domain'),
                    integration_id: integrationId,
                })
            }
            setEditorOpen(false)
        },
        [currentAccount, integrationId]
    )

    //buttons management
    const [availableSpace, setAvailableSpace] = useState<number | undefined>()
    const [nbButtonDisplayed, setNbButtonDisplayed] = useState<number>(
        NB_MIN_BUTTON_DISPLAYED
    )
    const containerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (ResizeObserver && containerRef.current) {
            const resizeObserver = new ResizeObserver((entries) => {
                const width = entries[0].borderBoxSize[0].inlineSize
                setAvailableSpace(width)
            })
            resizeObserver.observe(containerRef.current)
            return () => {
                resizeObserver.disconnect()
            }
        }
    }, [])
    useDebounce(
        () => {
            setNbButtonDisplayed(
                computeNbButtonDisplayed(buttons, availableSpace)
            )
        },
        200,
        [buttons, availableSpace]
    )

    // dropdown management
    const displayedButtons = buttons.slice(0, nbButtonDisplayed)
    const dropdownButtons = buttons.slice(nbButtonDisplayed)

    return (
        <div ref={containerRef}>
            <Group className={classnames(css.actionButtons)}>
                {displayedButtons.map((button, index) => {
                    return (
                        <Button
                            key={index}
                            index={index}
                            label={renderTemplate(
                                button.label,
                                templateContext
                            )}
                            action={button.action}
                            openEditor={openEditor}
                        />
                    )
                })}
                {dropdownButtons.length > 0 && (
                    <GroupItem>
                        {(appendPosition) => (
                            <UncontrolledDropdown>
                                <DropdownToggle tag={'span'}>
                                    <IconButton
                                        appendPosition={appendPosition}
                                        intent={ButtonIntent.Secondary}
                                    >
                                        more_horiz
                                    </IconButton>
                                </DropdownToggle>
                                <DropdownMenu right>
                                    {dropdownButtons.map((button, index) => (
                                        <Button
                                            key={index}
                                            index={index + nbButtonDisplayed}
                                            label={renderTemplate(
                                                button.label,
                                                templateContext
                                            )}
                                            openEditor={openEditor}
                                            action={button.action}
                                            isDropdown
                                        />
                                    ))}
                                </DropdownMenu>
                            </UncontrolledDropdown>
                        )}
                    </GroupItem>
                )}
            </Group>
            <Modal
                isOpen={isEditorOpen}
                onClose={handleCloseEditor}
                backdrop="static"
            >
                <ActionEditor
                    onSubmit={handleSubmit!}
                    onClose={handleCloseEditor}
                    action={buttons[editIndex].action}
                />
            </Modal>
        </div>
    )
}

export default memo(ButtonsGroup)

function computeNbButtonDisplayed(
    buttons: ButtonType[],
    availableSpace: number | undefined
) {
    if (buttons.length <= NB_MIN_BUTTON_DISPLAYED || !availableSpace)
        return NB_MIN_BUTTON_DISPLAYED

    let nbButtonDisplayed = 0
    let computedLength = 0

    while (
        nbButtonDisplayed < buttons.length &&
        computedLength <= availableSpace
    ) {
        computedLength += computeButtonLength(buttons[nbButtonDisplayed])
        nbButtonDisplayed++
    }

    let newAvailablePxSpace = availableSpace
    if (nbButtonDisplayed < buttons.length)
        newAvailablePxSpace = availableSpace - SHOW_MORE_WIDTH

    while (computedLength > newAvailablePxSpace && nbButtonDisplayed > 0) {
        nbButtonDisplayed--
        computedLength -= computeButtonLength(buttons[nbButtonDisplayed])
        if (nbButtonDisplayed < buttons.length)
            newAvailablePxSpace = availableSpace - SHOW_MORE_WIDTH
    }

    return nbButtonDisplayed < NB_MIN_BUTTON_DISPLAYED
        ? NB_MIN_BUTTON_DISPLAYED
        : nbButtonDisplayed
}

function computeButtonLength(button: ButtonType) {
    return button.label.length * FONT_SIZE + BUTTON_SPACING
}
