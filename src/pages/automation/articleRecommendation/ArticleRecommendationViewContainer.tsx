import React from 'react'
import {Redirect} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'

import ArticleRecommendationView from './ArticleRecommendationView'

const ArticleRecommendationViewContainer = () => {
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    if (!hasAutomationAddOn) {
        return <Redirect to="/app/automation/article-recommendation" />
    }

    return <ArticleRecommendationView />
}

export default ArticleRecommendationViewContainer
