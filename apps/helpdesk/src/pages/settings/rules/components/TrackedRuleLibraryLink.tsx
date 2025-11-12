import { logEvent, SegmentEvent } from '@repo/logging'
import { Link } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

export enum Source {
    CreateRuleButton = 'create-rule-button',
    CreateRuleFooter = 'create-rule-footer',
    BrowseTemplatesCard = 'browse-templates-card',
}

type Props = {
    from: Source
    children: React.ReactNode
}

const TrackedRuleLibraryLink: React.FC<Props> = ({ from, children }) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    return (
        <Link
            to={`/app/settings/rules/library`}
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
