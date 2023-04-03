import React from 'react'

import PageHeader from 'pages/common/components/PageHeader'

import css from './TicketFieldsStatsPage.less'

export default function TicketFieldStatsPage() {
    return (
        <div className={css.layout}>
            <PageHeader title="Ticket fields" />
            <div className={css.container}>
                <section
                    className={css.content}
                    data-candu-id="stats-page-content"
                ></section>
                <div
                    className={css.imageContainer}
                    data-candu-id="stats-page-image"
                ></div>
            </div>
        </div>
    )
}
