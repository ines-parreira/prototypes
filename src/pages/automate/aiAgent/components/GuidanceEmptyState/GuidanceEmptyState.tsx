import React from 'react'
import classNames from 'classnames'
import imgSrc from 'assets/img/ai-agent/guidance-empty-state.png'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import LinkButton from 'pages/common/components/button/LinkButton'
import css from './GuidanceEmptyState.less'

type Props = {
    shopName: string
}

export const GuidanceEmptyState = ({shopName}: Props) => {
    return (
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
                        <LinkButton
                            href={`/app/automation/shopify/${shopName}/ai-agent/guidance/new`}
                            target="_self"
                        >
                            Create Guidance
                        </LinkButton>
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
    )
}
