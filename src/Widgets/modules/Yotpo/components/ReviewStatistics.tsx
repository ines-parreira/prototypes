import type {Map} from 'immutable'
import React from 'react'

import {toJS} from 'utils'

import {CardCustomization} from 'Widgets/modules/Template/modules/Card'

import {CardContentYotpoReviewTopics} from './CardContentYotpoReviewTopics'
import {CardHeaderYotpoReviewStatistics} from './CardHeaderYotpoReviewStatistics'

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

export const reviewStatisticsCustomization: CardCustomization = {
    editionHiddenFields: ['link'],
    TitleWrapper,
    AfterContent,
}
