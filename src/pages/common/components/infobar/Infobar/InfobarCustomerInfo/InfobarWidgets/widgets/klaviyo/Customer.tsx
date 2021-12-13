import {Map} from 'immutable'
import React, {ReactNode} from 'react'
import {Card, CardBody, CardTitle} from 'reactstrap'

import logo from 'assets/img/infobar/klaviyo.svg'

import {CardHeaderIcon} from '../CardHeaderIcon'
import {CardHeaderTitle} from '../CardHeaderTitle'
import {CardHeaderSubtitle} from '../CardHeaderSubtitle'

import css from './Customer.less'

export default function Customer() {
    return {
        TitleWrapper,
        BeforeContent,
    }
}

type AfterContentProps = {
    isEditing: boolean
    source: Map<any, any>
}

const BeforeContent = (props: AfterContentProps) => {
    const {source} = props
    const lists: Array<Map<any, any>> = source.get('lists')
    return (
        <Card>
            <CardTitle className="header clearfix pr-5">
                <i className="material-icons">recent_actors</i> {} Lists
            </CardTitle>

            <CardBody className={css.customCard}>
                {lists ? (
                    <table>
                        <tbody>
                            {lists.map((obj: Map<any, any>) => {
                                return (
                                    <tr key={obj.get('list_id')}>
                                        <td>
                                            <p className={css.tableItem}>
                                                {obj.get('list_name')}
                                            </p>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                ) : (
                    <>
                        <p>Not subscribed to any list.</p>
                    </>
                )}
            </CardBody>
        </Card>
    )
}

type TitleWrapperProps = {
    children: ReactNode | null
    source: Map<string, string>
}

const TitleWrapper = (props: TitleWrapperProps) => {
    const {children, source} = props
    const customerId: string = source.getIn(['data', 'id'])
    const link = `https://www.klaviyo.com/profile/${customerId}/p`

    return (
        <>
            <CardHeaderIcon src={logo} alt="Klaviyo" />
            <CardHeaderTitle>Klaviyo</CardHeaderTitle>
            <CardHeaderSubtitle>
                <a href={link} target="_blank" rel="noopener noreferrer">
                    {children}
                </a>
            </CardHeaderSubtitle>
        </>
    )
}
