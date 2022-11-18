import React from 'react'
import {ListGroup} from 'reactstrap'

import css from '../SelfServicePreview.less'
import HomePageListGroupItem from './HomePageListGroupItem'

type Props = {
    sspTexts: {[key: string]: string}
    quickResponses: string[]
}

export const QuickResponseFlow = ({sspTexts, quickResponses}: Props) => {
    if (quickResponses.length === 0) {
        return null
    }

    return (
        <ListGroup className={css.buttons}>
            <HomePageListGroupItem header>
                {sspTexts.quickAnswers}
            </HomePageListGroupItem>
            {quickResponses.map((response) => (
                <HomePageListGroupItem key={response} arrowRight>
                    {response}
                </HomePageListGroupItem>
            ))}
        </ListGroup>
    )
}
