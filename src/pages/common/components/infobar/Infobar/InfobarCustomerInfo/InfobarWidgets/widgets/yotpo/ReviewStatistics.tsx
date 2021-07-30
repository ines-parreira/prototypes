import React from 'react'
import type {Map} from 'immutable'

import {toJS} from '../../../../../../../../../utils'

import {CardHeaderYotpoReviewStatistics} from './custom/CardHeaderYotpoReviewStatistics.js'
import {CardContentYotpoReviewTopics} from './custom/CardContentYotpoReviewTopics'

export default function ReviewStatistics() {
    return {
        editionHiddenFields: ['link'],
        TitleWrapper,
        AfterContent,
    }
}

type TitleWrapperProps = {
    source: Map<string, any>
}

class TitleWrapper extends React.Component<TitleWrapperProps> {
    render() {
        const {source} = this.props

        return (
            <>
                <CardHeaderYotpoReviewStatistics>
                    {source.getIn(['total_reviews'])}
                </CardHeaderYotpoReviewStatistics>
            </>
        )
    }
}

type AfterContentReviewStatisticsProps = {
    source: Map<string, any>
}
class AfterContent extends React.Component<AfterContentReviewStatisticsProps> {
    render() {
        const {source} = this.props

        return (
            <>
                <CardContentYotpoReviewTopics>
                    {toJS(source.getIn(['top_topics'], {}))}
                </CardContentYotpoReviewTopics>
            </>
        )
    }
}
