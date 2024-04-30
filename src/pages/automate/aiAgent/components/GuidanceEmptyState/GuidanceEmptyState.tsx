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
import {GuidanceTemplateKey} from '../../types'
import css from './GuidanceEmptyState.less'

const SHOW_TEMPLATES_COUNT = 2

type Props = {
    shopName: string
}

export const GuidanceEmptyState = ({shopName}: Props) => {
    const {routes} = useAiAgentNavigation({shopName})
    const {guidanceTemplates} = useGuidanceTemplates()
    const onNewClick = () => {
        history.push(routes.newGuidanceArticle)
    }
    const onGuidanceTemplateClick = (templateId: GuidanceTemplateKey) => {
        history.push(routes.newGuidanceTemplateArticle(templateId))
    }

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
                        <p className={css.title}>Guide your AI agent</p>
                        <p className={css.subtitle}>
                            Add guidance to help your AI agent provide the right
                            answers in the right way.
                        </p>
                        <div>
                            <Button onClick={onNewClick}>
                                Create Guidance
                            </Button>
                        </div>
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
                    <h3 className={css.templatesTitle}>
                        Start with a template
                    </h3>
                    <ul className={css.templatesList}>
                        {guidanceTemplates
                            .slice(0, SHOW_TEMPLATES_COUNT)
                            .map((template) => (
                                <li
                                    key={template.id}
                                    className={css.templatesItem}
                                >
                                    <GuidanceTemplateCard
                                        onClick={() =>
                                            onGuidanceTemplateClick(template.id)
                                        }
                                        guidanceTemplate={template}
                                    />
                                </li>
                            ))}

                        <li className={css.showMoreLink}>
                            <Link to={routes.guidanceTemplates}>
                                <Button intent="secondary" fillStyle="ghost">
                                    <ButtonIconLabel
                                        position="right"
                                        icon="arrow_forward"
                                    >
                                        See All Templates
                                    </ButtonIconLabel>
                                </Button>
                            </Link>
                        </li>
                    </ul>
                </div>
            )}
        </>
    )
}
