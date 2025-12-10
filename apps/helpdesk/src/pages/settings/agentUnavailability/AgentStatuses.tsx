import PageHeader from 'pages/common/components/PageHeader'

import css from '../settings.less'

export default function AgentStatuses() {
    return (
        <div className="full-width">
            <PageHeader title="Agent statuses" />

            <div className={css.pageContainer}>
                <div className={css.contentWrapper}>
                    <p>Agent statuses page</p>
                </div>
            </div>
        </div>
    )
}
