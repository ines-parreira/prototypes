import { AutoQA } from 'auto_qa'

import css from './TicketInfobarContainer.less'

export const AutoQAInfobarPanel = () => (
    <div className={css.autoQaContainer}>
        <AutoQA />
    </div>
)
