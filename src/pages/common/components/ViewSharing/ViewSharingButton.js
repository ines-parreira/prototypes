// @flow

// $FlowFixMe
import React, {useState} from 'react'
import {Button} from 'reactstrap'
import {connect} from 'react-redux'
import classnames from 'classnames'
import _capitalize from 'lodash/capitalize'

import type {viewType} from '../../../../state/views/types'
import type {currentUserType} from '../../../../state/types'
import {hasRole} from '../../../../utils.ts'
import {AGENT_ROLE} from '../../../../config/user.ts'
import {SYSTEM_VIEW_CATEGORY} from '../../../../constants/view.ts'

import {AccountFeatures} from '../../../../state/currentAccount/types.ts'

import ViewSharingButtonTooltip from './ViewSharingButtonTooltip'
import ViewSharingModal from './ViewSharingModal'
import css from './ViewSharingButton.less'

type Props = {
    className: string,
    currentUser: currentUserType,
    view: viewType,
    hasViewSharingFeature: boolean,
}

function ViewSharingButton({
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

const mapStateToProps = (state) => {
    const features = state.currentAccount.get('features')
    const hasViewSharingFeature = features.get(AccountFeatures.ViewSharing)
    return {
        currentUser: state.currentUser,
        hasViewSharingFeature,
    }
}
export default connect(mapStateToProps)(ViewSharingButton)
