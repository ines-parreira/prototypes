import React, {useState} from 'react'
import {Button} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import _capitalize from 'lodash/capitalize'
import {Map} from 'immutable'

import {RootState} from '../../../../state/types'
import {hasRole} from '../../../../utils'
import {AGENT_ROLE} from '../../../../config/user'
import {SYSTEM_VIEW_CATEGORY} from '../../../../constants/view'
import {AccountFeature} from '../../../../state/currentAccount/types'
import {currentAccountHasFeature} from '../../../../state/currentAccount/selectors'

import ViewSharingButtonTooltip from './ViewSharingButtonTooltip'
import ViewSharingModal from './ViewSharingModal/ViewSharingModal'
import css from './ViewSharingButton.less'

type OwnProps = {
    className: string
    view: Map<any, any>
}

type Props = OwnProps & ConnectedProps<typeof connector>

export function ViewSharingButtonContainer({
    currentUser,
    view,
    className,
    hasViewSharingFeature,
}: Props) {
    const isSystem = view.get('category') === SYSTEM_VIEW_CATEGORY
    const label = _capitalize(view.get('visibility'))
    const [isOpen, setOpen] = useState(false)
    const isAllowed = hasRole(currentUser, AGENT_ROLE)
    const isEditable = isAllowed && !isSystem

    const toggle = () => setOpen(!isOpen)

    return (
        <>
            <Button
                className={classnames(css.container, className)}
                onClick={toggle}
                disabled={!isEditable}
                id="view-sharing-button"
                href="#"
            >
                <i className="material-icons">person_add</i> Sharing:{' '}
                <b>{label}</b>
            </Button>
            {isEditable && isOpen && (
                <ViewSharingModal
                    view={view}
                    isOpen={isOpen}
                    toggle={toggle}
                    showPaywall={!hasViewSharingFeature}
                />
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
    hasViewSharingFeature: currentAccountHasFeature(AccountFeature.ViewSharing)(
        state
    ),
}))

export default connector(ViewSharingButtonContainer)
