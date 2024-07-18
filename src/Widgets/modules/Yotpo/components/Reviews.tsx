import React from 'react'
import {List, Map} from 'immutable'

import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import StarRating from 'pages/common/components/StarRating'

import StaticField from 'Widgets/modules/Template/modules/Field/components/StaticField'
import {CardCustomization} from 'Widgets/modules/Template/modules/Card'

import css from './Reviews.less'

type ReviewSearchURL = {
    url: string
    target: string
}

function makeReviewSearchURL(searchTerm: string): ReviewSearchURL {
    if (!searchTerm) {
        return {url: '#', target: '_self'}
    }
    return {
        url: `https://reviews.yotpo.com/#/moderation/reviews?query=${searchTerm}&sort_by=review_creation_date`,
        target: '_blank',
    }
}

type TitleWrapperProps = {
    source: Map<string, any>
}

class TitleWrapper extends React.Component<TitleWrapperProps> {
    render() {
        const {source} = this.props
        const reviewSearchURL = makeReviewSearchURL(source.get('title'))
        return (
            <a
                className={css.title}
                target={reviewSearchURL.target}
                href={reviewSearchURL.url}
            >
                <span className={`material-icons ${css.inventory}`}>
                    inventory
                </span>
                <span>{source.get('title')}</span>
            </a>
        )
    }
}

type AfterTitleProps = {
    source: Map<string, any>
}
class AfterTitle extends React.Component<AfterTitleProps> {
    render() {
        const {source} = this.props
        return (
            <div className={css.afterTitle}>
                <StaticField label="Created">
                    <DatetimeLabel
                        key="created-at"
                        dateTime={source.get('created_at') as string}
                    />
                </StaticField>
                <StaticField>
                    <StarRating value={(source.get('score') as number) || 0} />
                </StaticField>
            </div>
        )
    }
}

type BeforeContentReviewsProps = {
    source: Map<string, any>
}
class BeforeContent extends React.Component<BeforeContentReviewsProps> {
    render() {
        const {source} = this.props
        const imagesData: List<Map<string, string>> = source.get(
            'images_data',
            []
        )
        return (
            <>
                <div>
                    <StaticField>{source.get('title')}</StaticField>
                    <StaticField isNotBold>{source.get('content')}</StaticField>
                </div>
                {imagesData.size > 0 && (
                    <StaticField>
                        {imagesData.map(
                            (img) =>
                                img && (
                                    <img
                                        key={img.get('id')}
                                        alt={`review ${img.get('id')}`}
                                        src={img.get('thumb_url')}
                                        className={css.reviewImage}
                                    />
                                )
                        )}
                    </StaticField>
                )}
                <div>
                    <StaticField>
                        {/*
                        Commented out while waiting for Yotpo to implement the feature
                        <a href={makeReviewSearchURL(source.get('title'))} target="_blank">View reply</a>
                    */}
                        <span
                            className={`material-icons ${css.reviewFooterThumb}`}
                        >
                            thumb_down{' '}
                        </span>
                        <b>{source.get('votes_up')}</b>
                        <span
                            className={`material-icons ${css.reviewFooterThumb}`}
                        >
                            thumb_up{' '}
                        </span>
                        <b>{source.get('votes_down')}</b>
                    </StaticField>
                </div>
            </>
        )
    }
}

export const reviewsCustomization: CardCustomization = {
    editionHiddenFields: ['link'],
    TitleWrapper,
    AfterTitle,
    BeforeContent,
}
