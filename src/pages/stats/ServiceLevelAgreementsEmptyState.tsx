import React from 'react'
import {Link} from 'react-router-dom'
import icon from 'assets/img/stats/no-slas-icon.png'
import Button from 'pages/common/components/button/Button'
import css from 'pages/stats/ServiceLevelAgreementsEmptyState.less'
import PageHeader from 'pages/common/components/PageHeader'
import ImageContainer from 'pages/common/components/EmptyState/ImageContainer'

export const SERVICE_LEVEL_AGREEMENTS_SETTINGS_PATH = '/app/settings/slas'
export const NO_BANNER_ALT_TEXT = 'No SLAs banner'
export const PAGE_TITLE = 'SLAs'
export const CONTENT_HEADER_TEXT =
    'Exceed customer expectations with Service Level Agreements(SLAs)'
export const CONTENT_BODY_TEXT_PARAGRAPH_1 =
    'Enable SLA policies to set clear internal responsiveness targets and delight customers.'
export const CONTENT_BODY_TEXT_PARAGRAPH_2 =
    'Analyze team performance to identify opportunities for enhancing efficiency and fostering growth'
export const CONTENT_SET_UP_BUTTON_TEXT = 'Set up your first SLA'

export const ServiceLevelAgreementsEmptyState = () => (
    <div className={`full-height ${css.container}`}>
        <PageHeader title={PAGE_TITLE} />
        <div className={css.contentWrapper}>
            <ImageContainer>
                <img
                    src={icon}
                    height={436}
                    width={600}
                    alt={NO_BANNER_ALT_TEXT}
                />
            </ImageContainer>

            <div className={css.content}>
                <div className={css.textContent}>
                    <p className={css.textContentHeading}>
                        {CONTENT_HEADER_TEXT}
                    </p>
                    <div className={css.textContentBody}>
                        <p>{CONTENT_BODY_TEXT_PARAGRAPH_1}</p>
                        <p>{CONTENT_BODY_TEXT_PARAGRAPH_2}</p>
                    </div>
                </div>

                <Link
                    className={css.textContentLink}
                    to={SERVICE_LEVEL_AGREEMENTS_SETTINGS_PATH}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button>{CONTENT_SET_UP_BUTTON_TEXT}</Button>
                </Link>
            </div>
        </div>
    </div>
)
