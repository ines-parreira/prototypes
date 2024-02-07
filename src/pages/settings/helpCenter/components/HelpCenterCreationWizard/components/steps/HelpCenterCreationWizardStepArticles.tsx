import React, {useEffect, useState} from 'react'

import {map} from 'lodash'
import {
    ArticleTemplateCategory,
    HelpCenter,
    HelpCenterArticleItem,
    HelpCenterAutomateType,
    HelpCenterCreationWizardStep,
} from 'models/helpCenter/types'
import WizardStepSkeleton from 'pages/common/components/wizard/WizardStepSkeleton'
import {
    DEFAULT_ARTICLE_GROUP,
    HELP_CENTER_STEPS_DESCRIPTIONS,
    HELP_CENTER_STEPS_LABELS,
    HELP_CENTER_STEPS_TITLES,
} from 'pages/settings/helpCenter/constants'
import WizardFooter, {
    FOOTER_BUTTONS,
} from 'pages/common/components/wizard/WizardFooter'
import {useHelpCenterArticles} from '../../hooks/useHelpCenterArticles'
import {useHelpCenterCreationWizard} from '../../hooks/useHelpCenterCreationWizard'

import ArticleSection from '../HelpCenterWizardArticleSection/HelpCenterWizardArticleSection'

type Props = {
    helpCenter: HelpCenter
    automateType: HelpCenterAutomateType
}

const HelpCenterCreationWizardStepArticles: React.FC<Props> = ({
    helpCenter,
    automateType,
}) => {
    const [articles, setArticles] = useState<
        Record<ArticleTemplateCategory, HelpCenterArticleItem[]>
    >(DEFAULT_ARTICLE_GROUP)

    const {helpCenter: newHelpCenter} = useHelpCenterCreationWizard(
        helpCenter,
        HelpCenterCreationWizardStep.Articles
    )

    const {articles: fetchedArticles, isLoading} = useHelpCenterArticles(
        helpCenter.id,
        newHelpCenter.defaultLocale
    )

    const isAutomate = automateType === HelpCenterAutomateType.AUTOMATE

    useEffect(() => {
        setArticles(fetchedArticles)
    }, [fetchedArticles])

    const onFooterAction = (buttonClicked: FOOTER_BUTTONS) => {
        switch (buttonClicked) {
            case FOOTER_BUTTONS.FINISH:
                break
            case FOOTER_BUTTONS.BACK:
                break
            case FOOTER_BUTTONS.NEXT:
                break
            case FOOTER_BUTTONS.SAVE_AND_CUSTOMIZE_LATER:
                break
            default:
                break
        }
    }

    const onEdit = () => {
        // TODO: Implement edit article
    }

    const onSelect = (category: ArticleTemplateCategory, key: string) => {
        setArticles((prevState) => ({
            ...prevState,
            [category]: map(prevState[category], (article) =>
                article.key === key
                    ? {...article, isSelected: !article.isSelected}
                    : article
            ),
        }))
    }

    return (
        <>
            <WizardStepSkeleton
                step={HelpCenterCreationWizardStep.Articles}
                labels={HELP_CENTER_STEPS_LABELS}
                titles={HELP_CENTER_STEPS_TITLES}
                descriptions={HELP_CENTER_STEPS_DESCRIPTIONS}
                footer={
                    <WizardFooter
                        displaySaveAndCustomizeLater
                        displayBackButton={isAutomate}
                        displayNextButton={isAutomate}
                        displayFinishButton={!isAutomate}
                        onClick={onFooterAction}
                        isDisabled={isLoading}
                    />
                }
            >
                <div>
                    {Object.entries(articles).map(
                        ([category, articleItems]) => (
                            <ArticleSection
                                key={category}
                                articles={articleItems}
                                category={category as ArticleTemplateCategory}
                                onEdit={onEdit}
                                onSelect={onSelect}
                            />
                        )
                    )}
                </div>
            </WizardStepSkeleton>
        </>
    )
}

export default HelpCenterCreationWizardStepArticles
