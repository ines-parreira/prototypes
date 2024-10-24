import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useMemo} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {
    ArticleTemplateType,
    HelpCenter,
    HelpCenterAutomateType,
    HelpCenterCreationWizardStep,
} from 'models/helpCenter/types'
import WizardFooter, {
    FOOTER_BUTTONS,
} from 'pages/common/components/wizard/WizardFooter'
import WizardStepSkeleton from 'pages/common/components/wizard/WizardStepSkeleton'
import {
    HELP_CENTER_STEPS_DESCRIPTIONS,
    HELP_CENTER_STEPS_LABELS,
    HELP_CENTER_STEPS_TITLES,
    NEXT_ACTION,
} from 'pages/settings/helpCenter/constants'
import {ArticleOrigin} from 'pages/settings/helpCenter/types/articleOrigin.enum'

import {getEnabledArticlesCount} from '../../HelpCenterCreationWizardUtils'
import {useGetHelpCenterArticles} from '../../hooks/useGetHelpCenterArticles'

import {useHelpCenterArticlesForm} from '../../hooks/useHelpCenterArticlesForm'
import {useHelpCenterCreationWizard} from '../../hooks/useHelpCenterCreationWizard'
import ArticleEditor from '../HelpCenterWizardArticleEditor/HelpCenterWizardArticleEditor'
import HelpCenterWizardArticlePreview from '../HelpCenterWizardArticlePreview/HelpCenterWizardArticlePreview'
import ArticleSection from '../HelpCenterWizardArticleSection/HelpCenterWizardArticleSection'

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

    const {
        articles: fetchedArticles,
        hasAiArticles,
        isLoading: isGettingArticlesLoading,
    } = useGetHelpCenterArticles(
        helpCenter.id,
        helpCenter.default_locale,
        helpCenter.shop_name
    )

    const {
        articles,
        selectedArticle,
        hoveredArticle,
        isLoading: isSavingArticlesLoading,
        handleArticleHover,
        handleArticleSelect,
        handleArticleEdit,
        handleEditorReady,
        handleEditorSave,
        handleEditorClose,

        handleNavigationSave,
    } = useHelpCenterArticlesForm(
        helpCenter,
        fetchedArticles,
        ArticleOrigin.HELP_CENTER_WIZARD
    )

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

    //TODO: remove this flag when AI articles are released, no matter if they are enabled for all merchants or not. It should be hidden until it's QAed.
    const isAIArticlesEnabled =
        useFlags()[FeatureFlagKey.ObservabilityAIArticles] || false

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
                isLoading={isGettingArticlesLoading}
                metaStep={
                    hasAiArticles
                        ? ArticleTemplateType.AI
                        : ArticleTemplateType.Template
                }
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
                preview={
                    isAIArticlesEnabled ? (
                        <HelpCenterWizardArticlePreview
                            title={hoveredArticle?.title}
                            content={hoveredArticle?.content}
                        />
                    ) : null
                }
            >
                <div>
                    {Object.entries(articles).map(
                        ([category, articleItems]) => (
                            <ArticleSection
                                key={category}
                                articles={articleItems}
                                category={category}
                                isLoading={isGettingArticlesLoading}
                                isLimitEnabled={
                                    hasAiArticles &&
                                    category === ArticleTemplateType.Template
                                }
                                onEdit={handleArticleEdit}
                                onSelect={handleArticleSelect}
                                onHover={handleArticleHover}
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
