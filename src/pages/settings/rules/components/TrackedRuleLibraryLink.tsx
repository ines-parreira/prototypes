import React from 'react'
import {Link} from 'react-router-dom'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {getCurrentAccountState} from 'state/currentAccount/selectors'

import useAppSelector from 'hooks/useAppSelector'

export enum Source {
    CreateRuleButton = 'create-rule-button',
    CreateRuleFooter = 'create-rule-footer',
    BrowseTemplatesCard = 'browse-templates-card',
}

type Props = {
    from: Source
}

const TrackedRuleLibraryLink: React.FC<Props> = ({from, children}) => {
    const currentAccount = useAppSelector(getCurrentAccountState)

    return (
        <Link
            to="/app/settings/rules/library"
            onClick={() =>
                logEvent(SegmentEvent.RuleLibraryVisited, {
                    from,
                    domain: currentAccount?.get('domain'),
                })
            }
        >
            {children}
        </Link>
    )
}

export default TrackedRuleLibraryLink
