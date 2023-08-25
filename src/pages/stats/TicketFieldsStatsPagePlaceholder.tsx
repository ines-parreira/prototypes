import React from 'react'

import PageHeader from 'pages/common/components/PageHeader'

import css from './TicketFieldsStatsPagePlaceholder.less'

export default function TicketFieldsStatsPagePlaceholder() {
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
