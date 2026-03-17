import { diffChars } from '@repo/utils'
import classNames from 'classnames'

import css from './CharDiff.less'

type Props = {
    string1?: string
    string2?: string
}

export default function CharDiff({ string1 = '', string2 = '' }: Props) {
    const groups = diffChars(string1, string2)

    if (!groups) return null

    return (
        <span>
            {groups.map((group, index) => {
                let value = group.value
                const { added, removed } = group

                if ((added || removed) && !/\S/.test(value)) {
                    const linebreaks = value.match(/(\r\n|\r|\n)/g)

                    if (linebreaks) {
                        if (removed) value = `\u00b6`.repeat(linebreaks.length)
                        if (added) value = `\u00b6\n`.repeat(linebreaks.length)
                    }
                }

                return (
                    <span
                        key={`diff-${index}`}
                        className={classNames({
                            [css.added]: added,
                            [css.removed]: removed,
                        })}
                    >
                        {value}
                    </span>
                )
            })}
        </span>
    )
}
