import React from 'react'

import {
    ArticleTemplateCategory,
    HelpCenter,
    HelpCenterAutomateType,
    HelpCenterCreationWizardStep,
} from 'models/helpCenter/types'
import WizardStepSkeleton from 'pages/common/components/wizard/WizardStepSkeleton'
import {
    HELP_CENTER_STEPS_DESCRIPTIONS,
    HELP_CENTER_STEPS_LABELS,
    HELP_CENTER_STEPS_TITLES,
} from 'pages/settings/helpCenter/constants'
import WizardFooter, {
    FOOTER_BUTTONS,
} from 'pages/common/components/wizard/WizardFooter'
import {useGetHelpCenterArticles} from '../../hooks/useGetHelpCenterArticles'

import ArticleSection from '../HelpCenterWizardArticleSection/HelpCenterWizardArticleSection'
import ArticleEditor from '../HelpCenterWizardArticleEditor/HelpCenterWizardArticleEditor'
import {useHelpCenterArticlesForm} from '../../hooks/useHelpCenterArticlesForm'

type Props = {
    helpCenter: HelpCenter
    automateType: HelpCenterAutomateType
}

const HelpCenterCreationWizardStepArticles: React.FC<Props> = ({
    helpCenter,
    automateType,
}) => {
    const {articles: fetchedArticles, isLoading} = useGetHelpCenterArticles(
        helpCenter.id,
        helpCenter.default_locale
    )

    const {
        articles,
        selectedArticle,
        handleArticleSelect,
        handleArticleEdit,
        handleEditorReady,
        handleEditorSave,
        handleEditorClose,
    } = useHelpCenterArticlesForm(fetchedArticles)

    const isAutomate = automateType === HelpCenterAutomateType.AUTOMATE

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
                                onEdit={handleArticleEdit}
                                onSelect={handleArticleSelect}
                            />
                        )
                    )}
                    <ArticleEditor
                        article={selectedArticle}
                        locale={helpCenter.default_locale}
                        isLoading={isLoading}
                        onEditorSave={handleEditorSave}
                        onEditorClose={handleEditorClose}
                        onEditorReady={handleEditorReady}
                    />
                </div>
            </WizardStepSkeleton>
        </>
    )
}

export default HelpCenterCreationWizardStepArticles
