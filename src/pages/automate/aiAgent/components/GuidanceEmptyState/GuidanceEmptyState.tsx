import React from 'react'
import classNames from 'classnames'
import {Link} from 'react-router-dom'
import imgSrc from 'assets/img/ai-agent/guidance-empty-state.png'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Button from 'pages/common/components/button/Button'
import history from 'pages/history'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {useGuidanceTemplates} from '../../hooks/useGuidanceTemplates'
import {GuidanceTemplateCard} from '../GuidanceTemplateCard/GuidanceTemplateCard'
import {useAiAgentNavigation} from '../../hooks/useAiAgentNavigation'
import {CreateNewGuidanceCard} from '../CreateNewGuidanceCard/CreateNewGuidanceCard'
import css from './GuidanceEmptyState.less'

const SHOW_TEMPLATES_COUNT = 5

type Props = {
    shopName: string
}

export const GuidanceEmptyState = ({shopName}: Props) => {
    const {routes} = useAiAgentNavigation({shopName})
    const {guidanceTemplates} = useGuidanceTemplates()
    const onNewClick = () => {
        history.push(routes.newGuidanceArticle)
    }
    const onGuidanceTemplateClick = (templateId: string) => {
        history.push(routes.newGuidanceTemplateArticle(templateId))
    }

    const isShowMoreTemplates = guidanceTemplates.length > SHOW_TEMPLATES_COUNT

    return (
        <>
            <div className={css.container}>
                <div className={css.innerContainer}>
                    <div className={css.content}>
                        <div>
                            <Badge type={ColorType.Magenta}>
                                <i
                                    className={classNames(
                                        'material-icons',
                                        css.autoAwesome
                                    )}
                                >
                                    auto_awesome
                                </i>
                                AI Powered
                            </Badge>
                        </div>
                        <p className={css.title}>
                            Create Guidance to ensure AI Agent handles requests
                            according to your support policies
                        </p>
                        <p className={css.subtitle}>
                            Guidance is internal-facing knowledge that allows
                            you to customize AI Agent's behavior and fine-tune
                            how it handles customer requests.
                        </p>
                    </div>
                    <div className={css.imageWrapper}>
                        <img
                            className={css.img}
                            src={imgSrc}
                            alt="Guidance Empty State"
                        />
                    </div>
                </div>
            </div>

            {guidanceTemplates.length > 0 && (
                <div className={css.templatesContainer}>
                    <div className={css.templatesContainerHeader}>
                        <h3 className={css.templatesTitle}>
                            Choose a template and customize it to fit your needs
                        </h3>
                        <div
                            className={css.templatesContainerHeaderButtonGroup}
                        >
                            <Button intent="secondary" onClick={onNewClick}>
                                Create Custom Guidance
                            </Button>
                            <Link to={routes.guidanceTemplates}>
                                <Button>Create From Template</Button>
                            </Link>
                        </div>
                    </div>
                    <ul className={css.templatesList}>
                        {guidanceTemplates
                            .slice(0, SHOW_TEMPLATES_COUNT)
                            .map((template) => (
                                <li key={template.id}>
                                    <GuidanceTemplateCard
                                        onClick={() =>
                                            onGuidanceTemplateClick(template.id)
                                        }
                                        guidanceTemplate={template}
                                    />
                                </li>
                            ))}

                        {isShowMoreTemplates ? (
                            <li>
                                <Link
                                    to={routes.guidanceTemplates}
                                    className={css.showMoreLink}
                                >
                                    <Button
                                        intent="secondary"
                                        fillStyle="ghost"
                                    >
                                        <ButtonIconLabel
                                            position="right"
                                            icon="arrow_forward"
                                        >
                                            See All Templates
                                        </ButtonIconLabel>
                                    </Button>
                                </Link>
                            </li>
                        ) : (
                            <li className={css.templatesItem}>
                                <CreateNewGuidanceCard shopName={shopName} />
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </>
    )
}
