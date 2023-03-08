import React, {useCallback, useEffect, useState} from 'react'
import _uniqueId from 'lodash/uniqueId'
import {
    ContactForm,
    LocaleCode,
    UpdateContactForm,
} from 'models/helpCenter/types'
import Button from 'pages/common/components/button/Button'
import CheckBox from 'pages/common/forms/CheckBox'
import SubjectLine, {SubjectLineProps} from '../SubjectLine/SubjectLine'

import {
    LINE_HEIGHT,
    VISIBLE_LINES,
    MAX_SUBJECT_LINES,
    MAX_CHARACTERS,
} from './constants'
import css from './SubjectLines.less'

type SubjectLinesProps = {
    title: string
    description: string
    subjectLines: ContactForm['subject_lines']
    currentLocale: LocaleCode
    updateContactForm: React.Dispatch<React.SetStateAction<UpdateContactForm>>
    setIsDirty: React.Dispatch<React.SetStateAction<boolean>>
}

const SubjectLines = ({
    title,
    description,
    currentLocale,
    subjectLines,
    updateContactForm,
    setIsDirty,
}: SubjectLinesProps) => {
    const [subjectLinesWithId, setSubjectLinesWithId] = useState<
        {id: string; value: string}[]
    >([])
    const [subjectLinesExpanded, setSubjectLinesExpanded] = useState(false)

    // Initialize the subject lines with unique ids just when the locale changes
    useEffect(() => {
        if (subjectLines[currentLocale]) {
            updateSubjectLinesWithId(
                subjectLines[currentLocale].options.map((option) => ({
                    id: _uniqueId('subject-line-'),
                    value: option,
                }))
            )
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentLocale])

    const updateSubjectLinesWithId = useCallback(
        (subjectLines: {id: string; value: string}[]) => {
            setSubjectLinesWithId(subjectLines)

            updateContactForm((prevContactForm) => ({
                ...prevContactForm,
                subject_lines: {
                    ...prevContactForm.subject_lines,
                    [currentLocale]: {
                        allow_other:
                            prevContactForm.subject_lines?.[currentLocale]
                                ?.allow_other ?? true,
                        options: subjectLines.map(({value}) => value),
                    },
                },
            }))
        },
        [currentLocale, updateContactForm]
    )

    const handleOnChange = (newValue: string, id: string) => {
        const subjectLines = [...subjectLinesWithId]
        const subjectLineIndex = subjectLines.findIndex(
            (subjectLine) => subjectLine.id === id
        )

        if (subjectLineIndex === -1 || newValue.length > MAX_CHARACTERS) {
            return
        }

        subjectLines[subjectLineIndex].value = newValue

        updateSubjectLinesWithId(subjectLines)
        setIsDirty(true)
    }

    const handleOnDelete = (id: string) => {
        const subjectLines = [...subjectLinesWithId]
        const subjectLineIndex = subjectLines.findIndex(
            (subjectLine) => subjectLine.id === id
        )

        if (subjectLineIndex === -1) {
            return
        }

        subjectLines.splice(subjectLineIndex, 1)

        updateSubjectLinesWithId(subjectLines)
        setIsDirty(true)
    }

    const handleOnAdd = () => {
        updateSubjectLinesWithId([
            ...subjectLinesWithId,
            {id: _uniqueId('subject-line-'), value: ''},
        ])
        setSubjectLinesExpanded(true)
        setIsDirty(true)
    }

    const handleOnMoveEntity = (dragIndex: number, hoverIndex: number) => {
        const subjectLines = [...subjectLinesWithId]
        const dragSubjectLine = subjectLines[dragIndex]

        subjectLines.splice(dragIndex, 1)
        subjectLines.splice(hoverIndex, 0, dragSubjectLine)

        updateSubjectLinesWithId(subjectLines)
        setIsDirty(true)
    }

    const handleOnToggleCheckbox = (value: boolean) => {
        const newSubjectLines: UpdateContactForm['subject_lines'] = {
            ...subjectLines,
            [currentLocale]: {
                options: subjectLines[currentLocale]?.options || [],
                allow_other: value,
            },
        }

        updateContactForm((prevContactForm) => ({
            ...prevContactForm,
            subject_lines: {
                ...prevContactForm.subject_lines,
                ...newSubjectLines,
            },
        }))
        setIsDirty(true)
    }

    return (
        <div className={css.wrapper}>
            <div className={css.title}>{title}</div>
            <div className={css.description}>{description}</div>
            {subjectLinesWithId.length > 0 && (
                <CheckBox
                    isChecked={subjectLines[currentLocale]?.allow_other}
                    onChange={handleOnToggleCheckbox}
                    className={css.checkbox}
                >
                    Allow custom input using “Other”
                </CheckBox>
            )}

            <div
                className={css.subjectLinesWrapper}
                style={{
                    maxHeight: subjectLinesExpanded
                        ? `${subjectLinesWithId.length * LINE_HEIGHT}px`
                        : `${VISIBLE_LINES * LINE_HEIGHT}px`,
                }}
                onMouseDown={() => setSubjectLinesExpanded(true)}
            >
                {subjectLinesWithId?.map((line, index) => {
                    const subjectLine: SubjectLineProps = {
                        value: line.value,
                        position: index,
                        onDelete: () => handleOnDelete(line.id),
                        onChange: (value) => handleOnChange(value, line.id),
                        onMoveEntity: handleOnMoveEntity,
                    }
                    return (
                        <SubjectLine
                            key={`subjectLine-${line.id}`}
                            {...subjectLine}
                        />
                    )
                })}
            </div>
            <div className={css.footer}>
                <Button
                    intent="secondary"
                    onClick={handleOnAdd}
                    className={css.button}
                    isDisabled={subjectLinesWithId.length >= MAX_SUBJECT_LINES}
                >
                    <i className="material-icons">add</i>
                    <span>Add Subject Line</span>
                </Button>
                {subjectLinesWithId?.length > 5 && (
                    <div
                        className={css.textButton}
                        onMouseDown={(event) => {
                            event.stopPropagation()
                            setSubjectLinesExpanded((prev) => !prev)
                        }}
                    >
                        {subjectLinesExpanded ? 'Show less' : 'Show all'}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SubjectLines
