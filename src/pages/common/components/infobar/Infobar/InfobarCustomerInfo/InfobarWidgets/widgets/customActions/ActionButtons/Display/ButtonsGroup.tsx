import React, {
    memo,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    useRef,
} from 'react'
import {UncontrolledDropdown, DropdownMenu, DropdownToggle} from 'reactstrap'
import classnames from 'classnames'

import {isSourceRecord, Source} from 'models/widget/types'
import {logEvent, SegmentEvent} from 'common/segment'
import Group from 'pages/common/components/layout/Group'
import IconButton from 'pages/common/components/button/IconButton'
import {renderTemplate} from 'pages/common/utils/template'
import {getTicket} from 'state/ticket/selectors'
import {getActiveCustomer} from 'state/customers/selectors'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {AppContext} from 'providers/infobar/AppContext'
import {
    Action,
    Button as ButtonType,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import css from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/ActionButtons/ActionButtons.less'
import useAppSelector from 'hooks/useAppSelector'
import useDebouncedEffect from 'hooks/useDebouncedEffect'
import Modal from 'pages/common/components/modal/Modal'

import Button from './Button'
import ActionEditor from './ActionEditor'

const NB_MIN_BUTTON_DISPLAYED = 2
const FONT_SIZE = 12
const BUTTON_SPACING = 18
const SHOW_MORE_WIDTH = 31

type Props = {
    buttons: ButtonType[]
    source: Source
}

type HandleSubmit = (action: Action) => void

function ButtonsGroup({buttons, source}: Props) {
    // templating management
    const ticket = useAppSelector(getTicket)
    const user = useAppSelector(getActiveCustomer)
    const templateContext = useMemo(() => {
        return {
            ...(isSourceRecord(source) ? source : {}),
            ticket,
            user,
        }
    }, [user, source, ticket])

    // editor management
    const currentAccount = useAppSelector(getCurrentAccountState)
    const {integrationId} = useContext(IntegrationContext)
    const {appId} = useContext(AppContext)
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
                    app_id: appId,
                })
            }
            setEditorOpen(false)
        },
        [currentAccount, integrationId, appId]
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
    useDebouncedEffect(
        () => {
            setNbButtonDisplayed(
                computeNbButtonDisplayed(
                    buttons,
                    templateContext,
                    availableSpace
                )
            )
        },
        [buttons, availableSpace],
        200
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
                    <UncontrolledDropdown>
                        <DropdownToggle tag={'span'}>
                            <IconButton size="small" intent="secondary">
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
            </Group>
            <Modal isOpen={isEditorOpen} onClose={handleCloseEditor}>
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
    templateContext: Record<string, unknown>,
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
        computedLength += computeButtonLength(
            buttons[nbButtonDisplayed],
            templateContext
        )
        nbButtonDisplayed++
    }

    let newAvailablePxSpace = availableSpace
    if (nbButtonDisplayed < buttons.length)
        newAvailablePxSpace = availableSpace - SHOW_MORE_WIDTH

    while (computedLength > newAvailablePxSpace && nbButtonDisplayed > 0) {
        nbButtonDisplayed--
        computedLength -= computeButtonLength(
            buttons[nbButtonDisplayed],
            templateContext
        )
        if (nbButtonDisplayed < buttons.length)
            newAvailablePxSpace = availableSpace - SHOW_MORE_WIDTH
    }

    return nbButtonDisplayed < NB_MIN_BUTTON_DISPLAYED
        ? NB_MIN_BUTTON_DISPLAYED
        : nbButtonDisplayed
}

export function computeButtonLength(
    button: ButtonType,
    templateContext: Record<string, unknown>
) {
    return (
        renderTemplate(button.label, templateContext).length * FONT_SIZE +
        BUTTON_SPACING
    )
}
