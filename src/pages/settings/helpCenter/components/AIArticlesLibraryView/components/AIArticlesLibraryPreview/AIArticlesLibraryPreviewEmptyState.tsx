import React from 'react'

import gorgiasLogo from '../../../../../../../assets/img/gorgias-logo.svg'

import css from './AIArticlesLibraryPreviewEmptyState.less'

const AIArticlesLibraryPreviewEmptyState: React.FC = () => (
    <div className={css.container}>
        <img src={gorgiasLogo} alt="Gorgias" />
    </div>
)

export default AIArticlesLibraryPreviewEmptyState
