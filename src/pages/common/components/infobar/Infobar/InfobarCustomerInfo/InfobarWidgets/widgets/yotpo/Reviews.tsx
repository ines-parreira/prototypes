import React from 'react'
import ReactStars from 'react-rating-stars-component'
import {List, Map} from 'immutable'

import {DatetimeLabel} from 'pages/common/utils/labels'
import {StarRatingColors} from 'pages/common/components/infobar/utils'
import {StaticField} from '../StaticField'

import css from './Reviews.less'

export default function Reviews() {
    return {
        editionHiddenFields: ['link'],
        TitleWrapper,
        AfterTitle,
        BeforeContent,
    }
}

export function starRatingProps(value: any) {
    return {
        activeColor: StarRatingColors.activeColor,
        value: parseFloat(value),
        size: 15,
        edit: false,
        isHalf: true,
        color: StarRatingColors.color,
        emptyIcon: <span className={`material-icons`}>star</span>,
        halfIcon: <span className={`material-icons`}>star_half</span>,
        filledIcon: <span className={`material-icons`}>star</span>,
    }
}

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
        const starRatings = starRatingProps(source.get('score'))
        return (
            <div className={css.afterTitle}>
                <StaticField label="Created">
                    <DatetimeLabel
                        key="created-at"
                        dateTime={source.get('created_at') as string}
                    />
                </StaticField>
                <StaticField>
                    <ReactStars {...starRatings} />
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
                    <StaticField noBold>{source.get('content')}</StaticField>
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
