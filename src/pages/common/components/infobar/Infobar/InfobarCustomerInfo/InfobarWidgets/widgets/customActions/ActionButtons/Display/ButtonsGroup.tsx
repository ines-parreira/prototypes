import React, {memo, useCallback, useContext, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import {
    ButtonDropdown,
    ButtonGroup,
    DropdownMenu,
    DropdownToggle,
    Modal,
} from 'reactstrap'
import {Map} from 'immutable'

import {renderTemplate} from '../../../../../../../../../utils/template'
import {getTicket} from '../../../../../../../../../../../state/ticket/selectors'
import {getActiveCustomer} from '../../../../../../../../../../../state/customers/selectors'
import {getCurrentAccountState} from '../../../../../../../../../../../state/currentAccount/selectors'
import {
    logEvent,
    SegmentEvent,
} from '../../../../../../../../../../../store/middlewares/segmentTracker'
import {IntegrationContext} from '../../../IntegrationContext'
import {Action, Button as ButtonType} from '../../types'
import css from '../ActionButtons.less'
import Button from './Button'
import ActionEditor from './ActionEditor'

const NB_BUTTONS_DISPLAYED = 2

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

    // dropdown management
    const [isDropdownOpen, setDropdownOpen] = useState(false)
    const toggleDropdown = useCallback(() => {
        setDropdownOpen((isDropdownOpen) => !isDropdownOpen)
    }, [])
    const displayedButtons = buttons.slice(0, NB_BUTTONS_DISPLAYED)
    const dropdownButtons = buttons.slice(NB_BUTTONS_DISPLAYED)

    return (
        <ButtonGroup className={css.actionButtons}>
            {displayedButtons.map((button, index) => {
                return (
                    <Button
                        key={index}
                        index={index}
                        label={renderTemplate(button.label, templateContext)}
                        action={button.action}
                        openEditor={openEditor}
                    />
                )
            })}
            {dropdownButtons.length > 0 && (
                <ButtonDropdown
                    className={css.dropdownButton}
                    isOpen={isDropdownOpen}
                    toggle={toggleDropdown}
                >
                    <DropdownToggle className={css.dropdownToggle}>
                        <i className={`material-icons ${css.dropdownIcon}`}>
                            more_horiz
                        </i>
                    </DropdownToggle>
                    <DropdownMenu right>
                        {dropdownButtons.map((button, index) => (
                            <Button
                                key={index}
                                index={index + NB_BUTTONS_DISPLAYED}
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
                </ButtonDropdown>
            )}
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
        </ButtonGroup>
    )
}

export default memo(ButtonsGroup)
