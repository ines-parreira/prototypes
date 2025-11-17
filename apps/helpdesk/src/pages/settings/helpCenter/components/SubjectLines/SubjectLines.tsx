import React, { useCallback, useEffect, useRef, useState } from 'react'

import _uniqueId from 'lodash/uniqueId'

import { LegacyButton as Button } from '@gorgias/axiom'

import type { UpdateSubjectLinesProps } from 'models/contactForm/types'
import CheckBox from 'pages/common/forms/CheckBox'

import type { SubjectLineProps } from '../SubjectLine/SubjectLine'
import SubjectLine from '../SubjectLine/SubjectLine'
import {
    LINE_HEIGHT,
    MAX_CHARACTERS,
    MAX_SUBJECT_LINES,
    VISIBLE_LINES,
} from './constants'

import css from './SubjectLines.less'

type SubjectLinesProps = {
    title: string
    description: string
    subjectLines: UpdateSubjectLinesProps | null
    updateSubjectLines: (props: UpdateSubjectLinesProps) => void
    setIsDirty: (isDirty: boolean) => void
}

const SubjectLines = ({
    title,
    description,
    subjectLines,
    updateSubjectLines,
    setIsDirty,
}: SubjectLinesProps) => {
    const [subjectLinesWithId, setSubjectLinesWithId] = useState<
        { id: string; value: string }[]
    >([])
    const [subjectLinesExpanded, setSubjectLinesExpanded] = useState(false)
    const lastSubjectLineRef = useRef<null | UpdateSubjectLinesProps>(null)

    // Initialize the subject lines with unique ids just when the locale/ref changes
    useEffect(() => {
        if (
            // We need this check to avoid loosing focus when the user is typing
            subjectLines !== lastSubjectLineRef.current &&
            subjectLines
        ) {
            setSubjectLinesWithId(
                subjectLines.options.map((option) => ({
                    id: _uniqueId('subject-line-'),
                    value: option,
                })),
            )

            lastSubjectLineRef.current = {
                allow_other: subjectLines?.allow_other ?? true,
                options: subjectLines?.options ?? [],
            }
        }
    }, [subjectLines])

    const updateSubjectLinesWithId = useCallback(
        (subjectLinesWithIds: { id: string; value: string }[]) => {
            setSubjectLinesWithId(subjectLinesWithIds)

            lastSubjectLineRef.current = {
                allow_other: subjectLines?.allow_other ?? true,
                options: subjectLinesWithIds.map(({ value }) => value),
            }

            updateSubjectLines(lastSubjectLineRef.current)
        },
        [subjectLines, updateSubjectLines],
    )

    const handleOnChange = (newValue: string, id: string) => {
        const subjectLines = [...subjectLinesWithId]
        const subjectLineIndex = subjectLines.findIndex(
            (subjectLine) => subjectLine.id === id,
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
            (subjectLine) => subjectLine.id === id,
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
            { id: _uniqueId('subject-line-'), value: '' },
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
        updateSubjectLines({
            options: subjectLines?.options || [],
            allow_other: value,
        })
        setIsDirty(true)
    }

    return (
        <div className={css.wrapper}>
            <div className={css.title}>{title}</div>
            <div className={css.description}>{description}</div>
            {subjectLinesWithId.length > 0 && (
                <CheckBox
                    isChecked={subjectLines?.allow_other}
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
