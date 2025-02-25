import React from 'react'

import classNames from 'classnames'
import { Card, CardBody } from 'reactstrap'

import { Infocard } from './types'

import css from './Detail.less'

export default function InfoCard(props: Infocard) {
    const { isHidden, banner, CTA, pricing, resources = {}, support } = props
    const { documentationLink, privacyPolicyLink, others } = resources

    if (isHidden) return null

    return (
        <Card className={css.infoCard}>
            {banner && <div className={css.rounderWrapper}>{banner}</div>}
            <CardBody>
                <div className={css.actionWrapper}>{CTA}</div>
                {(pricing?.detail || pricing?.link) && (
                    <>
                        <h2
                            className={classNames(
                                css.categoryTitle,
                                css.cardTitle,
                            )}
                        >
                            Pricing
                        </h2>

                        <ul className={css.cardList}>
                            {pricing.detail && (
                                <li
                                    dangerouslySetInnerHTML={{
                                        __html: pricing.detail,
                                    }}
                                />
                            )}
                            {pricing.link && (
                                <li>
                                    <a
                                        href={pricing.link}
                                        className={css.actionLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <i
                                            className={classNames(
                                                'material-icons-outlined',
                                                css.actionIcon,
                                                css.actionIconBigger,
                                            )}
                                        >
                                            attach_money
                                        </i>
                                        See pricing details
                                    </a>
                                </li>
                            )}
                        </ul>
                    </>
                )}
                {(documentationLink ||
                    privacyPolicyLink ||
                    (others && others.length > 0)) && (
                    <>
                        <h2
                            className={classNames(
                                css.categoryTitle,
                                css.cardTitle,
                            )}
                        >
                            Resources
                        </h2>
                        <ul className={css.cardList}>
                            {documentationLink && (
                                <li>
                                    <a
                                        href={documentationLink}
                                        className={css.actionLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <i
                                            className={classNames(
                                                'material-icons-outlined',
                                                css.actionIcon,
                                                css.actionIconBigger,
                                            )}
                                        >
                                            description
                                        </i>
                                        Documentation
                                    </a>
                                </li>
                            )}
                            {others &&
                                others.length > 0 &&
                                others.map(({ url, title, icon }, index) => (
                                    <li key={`resource_${index}`}>
                                        <a
                                            href={url}
                                            className={css.actionLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i
                                                className={classNames(
                                                    'material-icons',
                                                    css.actionIcon,
                                                )}
                                            >
                                                {icon}
                                            </i>
                                            {title}
                                        </a>
                                    </li>
                                ))}
                            {privacyPolicyLink && (
                                <li>
                                    <a
                                        href={privacyPolicyLink}
                                        className={css.actionLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <i
                                            className={classNames(
                                                'material-icons-outlined',
                                                css.actionIcon,
                                                css.actionIconBigger,
                                            )}
                                        >
                                            privacy_tip
                                        </i>
                                        Privacy Policy
                                    </a>
                                </li>
                            )}
                        </ul>
                    </>
                )}
                {(support?.email || support?.phone) && (
                    <>
                        <h2
                            className={classNames(
                                css.categoryTitle,
                                css.cardTitle,
                            )}
                        >
                            Support
                        </h2>
                        <ul className={css.cardList}>
                            {support.email && (
                                <li>
                                    <a
                                        href={`mailto:${support.email}`}
                                        className={css.actionLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <i
                                            className={classNames(
                                                'material-icons',
                                                css.actionIcon,
                                            )}
                                        >
                                            mail
                                        </i>
                                        {support.email}
                                    </a>
                                </li>
                            )}
                            {support.phone && (
                                <li>
                                    <a
                                        href={`tel:${support.phone}`}
                                        className={css.actionLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <i
                                            className={classNames(
                                                'material-icons',
                                                css.actionIcon,
                                            )}
                                        >
                                            phone
                                        </i>
                                        {support.phone}
                                    </a>
                                </li>
                            )}
                        </ul>
                    </>
                )}
            </CardBody>
        </Card>
    )
}
