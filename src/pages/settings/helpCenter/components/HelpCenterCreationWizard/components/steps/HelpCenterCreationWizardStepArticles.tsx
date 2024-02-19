import React, {useMemo} from 'react'

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
    NEXT_ACTION,
} from 'pages/settings/helpCenter/constants'
import WizardFooter, {
    FOOTER_BUTTONS,
} from 'pages/common/components/wizard/WizardFooter'
import {useGetHelpCenterArticles} from '../../hooks/useGetHelpCenterArticles'

import ArticleSection from '../HelpCenterWizardArticleSection/HelpCenterWizardArticleSection'
import ArticleEditor from '../HelpCenterWizardArticleEditor/HelpCenterWizardArticleEditor'
import {useHelpCenterArticlesForm} from '../../hooks/useHelpCenterArticlesForm'
import {useHelpCenterCreationWizard} from '../../hooks/useHelpCenterCreationWizard'
import {getEnabledArticlesCount} from '../../HelpCenterCreationWizardUtils'

type Props = {
    helpCenter: HelpCenter
    automateType: HelpCenterAutomateType
}

const HelpCenterCreationWizardStepArticles: React.FC<Props> = ({
    helpCenter,
    automateType,
}) => {
    const {
        handleSave,
        handleAction,
        isLoading: isUpdatingHelpCenterLoading,
    } = useHelpCenterCreationWizard(
        helpCenter,
        HelpCenterCreationWizardStep.Articles
    )

    const {articles: fetchedArticles, isLoading: isGettingArticlesLoading} =
        useGetHelpCenterArticles(helpCenter.id, helpCenter.default_locale)

    const {
        articles,
        selectedArticle,
        isLoading: isSavingArticlesLoading,
        handleArticleSelect,
        handleArticleEdit,
        handleEditorReady,
        handleEditorSave,
        handleEditorClose,
        handleNavigationSave,
    } = useHelpCenterArticlesForm(helpCenter, fetchedArticles)

    const isLoading = useMemo(() => {
        return (
            isGettingArticlesLoading ||
            isSavingArticlesLoading ||
            isUpdatingHelpCenterLoading
        )
    }, [
        isGettingArticlesLoading,
        isSavingArticlesLoading,
        isUpdatingHelpCenterLoading,
    ])

    const isAutomate = automateType === HelpCenterAutomateType.AUTOMATE

    const onFooterAction = async (buttonClicked: FOOTER_BUTTONS) => {
        switch (buttonClicked) {
            case FOOTER_BUTTONS.FINISH:
                await handleNavigationSave()
                handleSave({
                    redirectTo: NEXT_ACTION.NEW_HELP_CENTER,
                    payload: {
                        wizardCompleted: true,
                    },
                    successModalParams: {
                        articlesCount: getEnabledArticlesCount(articles),
                    },
                })
                break
            case FOOTER_BUTTONS.BACK:
                handleAction(NEXT_ACTION.PREVIOUS_STEP)
                break
            case FOOTER_BUTTONS.NEXT:
                await handleNavigationSave()
                handleSave({
                    redirectTo: NEXT_ACTION.NEXT_STEP,
                    stepName: HelpCenterCreationWizardStep.Automate,
                })
                break
            case FOOTER_BUTTONS.SAVE_AND_CUSTOMIZE_LATER:
                await handleNavigationSave()
                handleSave({
                    redirectTo: NEXT_ACTION.BACK_HOME,
                    stepName: HelpCenterCreationWizardStep.Articles,
                })
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
                        displayBackButton
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
