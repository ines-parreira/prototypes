import React, {useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import _capitalize from 'lodash/capitalize'
import {Map} from 'immutable'

import {RootState} from '../../../../state/types'
import {hasRole} from '../../../../utils'
import {AGENT_ROLE} from '../../../../config/user'
import {SYSTEM_VIEW_CATEGORY} from '../../../../constants/view'
import Button from '../button/Button'
import ButtonIconLabel from '../button/ButtonIconLabel'

import ViewSharingButtonTooltip from './ViewSharingButtonTooltip'
import ViewSharingModal from './ViewSharingModal/ViewSharingModal'
import css from './ViewSharingButton.less'

type OwnProps = {
    view: Map<any, any>
}

type Props = OwnProps & ConnectedProps<typeof connector>

export function ViewSharingButtonContainer({currentUser, view}: Props) {
    const isSystem = view.get('category') === SYSTEM_VIEW_CATEGORY
    const label = _capitalize(view.get('visibility'))
    const [isOpen, setOpen] = useState(false)
    const isAllowed = hasRole(currentUser, AGENT_ROLE)
    const isEditable = isAllowed && !isSystem

    const toggle = () => setOpen(!isOpen)

    return (
        <>
            <Button
                intent="secondary"
                onClick={toggle}
                isDisabled={!isEditable}
                id="view-sharing-button"
            >
                <ButtonIconLabel icon="person_add" className={css.label}>
                    Sharing: <b>{label}</b>
                </ButtonIconLabel>
            </Button>
            {isEditable && isOpen && (
                <ViewSharingModal view={view} isOpen={isOpen} toggle={toggle} />
            )}
            <ViewSharingButtonTooltip
                isSystem={isSystem}
                isAllowed={isAllowed}
            />
        </>
    )
}

const connector = connect((state: RootState) => ({
    currentUser: state.currentUser,
}))

export default connector(ViewSharingButtonContainer)
