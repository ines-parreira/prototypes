import { get } from 'lodash'
import { Col, Container, Row } from 'reactstrap'

import type {
    TextsPerLanguage,
    Translations,
} from '../../../../../../../../rest_api/gorgias_chat_protected_api/types'
import GorgiasTranslateInputField from './GorgiasTranslateInputField'
import type { FilterProps, OptionFormat } from './translations-available-keys'

import css from './GorgiasTranslateText.less'

export type Props = {
    title: string
    keys: string[]
    /**
     * Keys that must be filled in order to save the form.
     */
    requiredKeys?: string[]
    filtersForKeys: FilterProps
    textsPerLanguage: TextsPerLanguage | Record<string, unknown>
    translations: Translations
    saveValue: (key: string, value: string) => void
    formPropsValues: Record<string, OptionFormat>
    isFilteredByActive?: boolean // activate the use of filter to show/hide options
    trackInputMethod?: (key: string) => void
}

const GorgiasTranslateInputGroup = ({
    title,
    keys,
    requiredKeys = [],
    filtersForKeys,
    textsPerLanguage,
    translations,
    saveValue,
    formPropsValues,
    isFilteredByActive = false,
    trackInputMethod,
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
                                value={get(textsPerLanguage, key) || ''}
                                defaultValue={get(translations, key)}
                                saveValue={saveValue}
                                trackInputMethod={trackInputMethod}
                                isRequired={requiredKeys.includes(key)}
                                isRichText={!!propOption.isRichText}
                            />
                        </Col>
                    </Row>
                ) : null
            })}
        </Container>
    )
}

export default GorgiasTranslateInputGroup
