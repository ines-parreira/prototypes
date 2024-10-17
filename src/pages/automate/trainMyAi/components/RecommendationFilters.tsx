import React, {useEffect, useRef, useState} from 'react'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import CheckBox from 'pages/common/forms/CheckBox'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import {Paths} from 'rest_api/ssp_api/client.generated'
import SelectInputBox, {
    SelectInputBoxContext,
} from '../../../common/forms/input/SelectInputBox'
import ArticleSelect from './ArticleSelect'

import css from './RecommendationFilters.less'

export type FeedbackOptions =
    Paths.GetArticleRecommendationPredictions.Parameters.FeedbackOptions extends (infer U)[]
        ? U
        : never

export const DEFAULT_FEEDBACK_OPTIONS: FeedbackOptions[] = [
    'helpful',
    'not-helpful',
    'no-feedback',
]

type Props = {
    helpCenterId: number
    feedbackOptions: typeof DEFAULT_FEEDBACK_OPTIONS
    showCompleted: boolean
    articleId: number | null
    onHandleFeedbackOptionChange: (feedbackOption: FeedbackOptions) => void
    onHandleShowCompletedChange: (showCompleted: boolean) => void
    onHandleArticleChange: (articleId: number | null) => void
}

function getFeedbackOptionLabel(feedbackOption: FeedbackOptions) {
    return feedbackOption === 'helpful'
        ? 'Helpful'
        : feedbackOption === 'no-feedback'
          ? 'No Feedback'
          : 'Needed More Help'
}

export default function RecommendationFilter({
    helpCenterId,
    articleId,
    showCompleted,
    feedbackOptions,
    onHandleFeedbackOptionChange: handleFeedbackOption,
    onHandleShowCompletedChange: handleShowCompleted,
    onHandleArticleChange: handleArticleSelect,
}: Props) {
    const [isFeedbackDropdownOpen, setIsFeedbackDropdownOpen] = useState(false)
    const [feedbackDropdownInputLabel, setFeedbackDropdownInputLabel] =
        useState('')
    const feedbackDropdownTargetRef = useRef<HTMLDivElement>(null)
    const feedbackDropdownFloatingRef = useRef<HTMLDivElement>(null)

    const articleSelectKey = useRef(Math.random())

    useEffect(() => {
        if (feedbackOptions.length === DEFAULT_FEEDBACK_OPTIONS.length) {
            setFeedbackDropdownInputLabel('All Customer Feedback')
        } else {
            setFeedbackDropdownInputLabel(
                feedbackOptions.map(getFeedbackOptionLabel).sort().join(' and ')
            )
        }
    }, [feedbackOptions])

    useEffect(() => {
        if (articleId === null) {
            articleSelectKey.current = Math.random()
        }
    }, [articleId])

    return (
        <div className={css.container}>
            <div className={css.dropDownGroup}>
                <div>
                    <SelectInputBox
                        className={css.feedbackSelectInput}
                        floating={feedbackDropdownFloatingRef}
                        onToggle={setIsFeedbackDropdownOpen}
                        ref={feedbackDropdownTargetRef}
                        label={feedbackDropdownInputLabel}
                    >
                        <SelectInputBoxContext.Consumer>
                            {(context) => (
                                <Dropdown
                                    isMultiple
                                    isOpen={isFeedbackDropdownOpen}
                                    target={feedbackDropdownTargetRef}
                                    ref={feedbackDropdownFloatingRef}
                                    onToggle={() => context!.onBlur()}
                                    value={feedbackOptions}
                                >
                                    <DropdownBody>
                                        {DEFAULT_FEEDBACK_OPTIONS.map(
                                            (feedbackOption) => {
                                                const label =
                                                    getFeedbackOptionLabel(
                                                        feedbackOption
                                                    )
                                                return (
                                                    <DropdownItem
                                                        key={feedbackOption}
                                                        option={{
                                                            label,
                                                            value: feedbackOption,
                                                        }}
                                                        onClick={
                                                            handleFeedbackOption
                                                        }
                                                    >
                                                        {label}
                                                    </DropdownItem>
                                                )
                                            }
                                        )}
                                    </DropdownBody>
                                </Dropdown>
                            )}
                        </SelectInputBoxContext.Consumer>
                    </SelectInputBox>
                </div>

                <div>
                    <ArticleSelect
                        key={articleSelectKey.current}
                        contained={false}
                        includeAllArticles
                        helpCenterId={helpCenterId}
                        onChange={handleArticleSelect}
                        selectInputClassName={css.articleSelectInput}
                        autoFocus={false}
                    />
                </div>
            </div>

            <div className={css.completed}>
                <span>Show completed</span>
                <CheckBox
                    isChecked={showCompleted}
                    onChange={handleShowCompleted}
                />
            </div>
        </div>
    )
}
