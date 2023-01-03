import {get} from 'lodash'
import React from 'react'
import {Col, Container, Row} from 'reactstrap'
import {
    Texts,
    Translations,
} from '../../../../../../../rest_api/gorgias_chat_protected_api/types'

import GorgiasTranslateInputField from './GorgiasTranslateInputField'
import css from './GorgiasTranslateText.less'
import {FilterProps, OptionFormat} from './translations-available-keys'

export type Props = {
    title: string
    keys: string[]
    filtersForKeys: FilterProps
    texts: Texts | Record<string, unknown>
    translations: Translations
    saveValue: (key: string, value: string) => void
    formPropsValues: Record<string, OptionFormat>
    isFilteredByActive?: boolean // activate the use of filter to show/hide options
}

const GrogiasTranslateInputGroup = ({
    title,
    keys,
    filtersForKeys,
    texts,
    translations,
    saveValue,
    formPropsValues,
    isFilteredByActive = false,
}: Props) => {
    return (
        <Container fluid className={css.pageContainerBlocks}>
            <Row>
                <Col className={css.pageColumn} md="8">
                    <h2 className="heading-section-semibold">{title}</h2>
                </Col>
            </Row>

            {keys.map((key) => {
                const propOption: OptionFormat = get(formPropsValues, [key])

                if (!propOption) {
                    return null
                }

                const isAllowed =
                    isFilteredByActive && propOption.filteredBy
                        ? propOption.filteredBy(filtersForKeys)
                        : true

                return isAllowed ? (
                    <Row key={key}>
                        <Col className={css.pageColumn} md="8">
                            <GorgiasTranslateInputField
                                maxLength={propOption.maxLength}
                                keyName={key}
                                value={get(texts, key) || ''}
                                defaultValue={get(translations, key)}
                                saveValue={saveValue}
                            />
                        </Col>
                    </Row>
                ) : null
            })}
        </Container>
    )
}

export default GrogiasTranslateInputGroup
