import type { ReactNode } from 'react'

import { useId } from '@repo/hooks'

import Accordion from '../components/accordion/Accordion'
import AccordionBody from '../components/accordion/AccordionBody'
import AccordionHeader from '../components/accordion/AccordionHeader'
import AccordionItem from '../components/accordion/AccordionItem'
import RadioButton from '../components/RadioButton'

import css from './AccordionRadioFieldSet.less'

export type RadioFieldOption = {
    value: string
    label: ReactNode
    caption?: string | ReactNode
    body?: ReactNode
    disabled?: boolean
}

type Props = {
    isDisabled?: boolean
    name?: string
    onChange: (value: string) => void
    options: Array<RadioFieldOption>
    value: string | null
    defaultExpandedItem?: string
}

const AccordionRadioFieldSet = ({
    isDisabled = false,
    name,
    onChange,
    options,
    value: selectedValue,
    defaultExpandedItem,
}: Props) => {
    const id = useId()
    const fieldsetName = name || 'radio-field-' + id

    return (
        <fieldset disabled={isDisabled} name={fieldsetName}>
            <Accordion
                className={css.container}
                defaultExpandedItem={defaultExpandedItem}
            >
                {options.map(({ value, label, caption, disabled, body }) => (
                    <div onClick={() => onChange(value)} key={value}>
                        <AccordionItem id={value} key={value}>
                            <AccordionHeader
                                action={
                                    <RadioButton
                                        key={value}
                                        name={fieldsetName}
                                        value={value}
                                        label={label}
                                        caption={caption}
                                        isSelected={selectedValue === value}
                                        isDisabled={disabled || isDisabled}
                                        className={css.radioOption}
                                    />
                                }
                                isExpandable={!!body}
                            />
                            {body && <AccordionBody>{body}</AccordionBody>}
                        </AccordionItem>
                    </div>
                ))}
            </Accordion>
        </fieldset>
    )
}

export default AccordionRadioFieldSet
