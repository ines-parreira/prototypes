/**
 * This code is adapted from the jsdiff repository:
 * https://github.com/kpdecker/jsdiff/blob/master/src/diff/base.js
 *
 * The original code has been converted to TypeScript and modified as needed.
 * 
 * BSD 3-Clause License

    Copyright (c) 2009-2015, Kevin Decker <kpdecker@gmail.com>
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:

    1. Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.

    2. Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

    3. Neither the name of the copyright holder nor the names of its
    contributors may be used to endorse or promote products derived from
    this software without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
    FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
    DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
    SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
    CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
    OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
    OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Migrated from: apps/helpdesk/src/utils/diffCheck.ts
 */

export type PathComponent = {
    count: number
    added: boolean
    removed: boolean
    previousComponent?: PathComponent
    value: string
}

export type Path = {
    oldPos: number
    lastComponent?: PathComponent
}

export type Options = {
    comparator?: (left: string, right: string) => boolean
    ignoreCase?: boolean
    maxEditLength?: number
    timeout?: number
    oneChangePerToken?: boolean
}

export class Diff {
    useLongestToken = false

    diff(
        oldStringArg: string,
        newStringArg: string,
        optionsArg: Options = {},
    ): PathComponent[] | undefined {
        const options = optionsArg

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this

        function done(valueArg: PathComponent[]): PathComponent[] {
            let value = valueArg
            value = self.postProcess(value)

            return value
        }

        const oldStringTemp: string = this.castInput(oldStringArg)
        const newStringTemp: string = this.castInput(newStringArg)

        const oldString: string[] = this.removeEmpty(
            this.tokenize(oldStringTemp),
        )
        const newString: string[] = this.removeEmpty(
            this.tokenize(newStringTemp),
        )

        const newLen = newString.length
        const oldLen = oldString.length
        let editLength = 1
        let maxEditLength = newLen + oldLen
        if (options.maxEditLength != null) {
            maxEditLength = Math.min(maxEditLength, options.maxEditLength)
        }
        const maxExecutionTime = options.timeout ?? Infinity
        const abortAfterTimestamp = Date.now() + maxExecutionTime

        const bestPath: Path[] = [{ oldPos: -1, lastComponent: undefined }]

        let newPos = this.extractCommon(
            bestPath[0],
            newString,
            oldString,
            0,
            options,
        )

        // Seed editLength = 0, i.e. the content starts with the same values
        if (bestPath[0].oldPos + 1 >= oldLen && newPos + 1 >= newLen) {
            // Identity per the equality and tokenizer
            return done(
                buildValues(
                    self,
                    bestPath[0].lastComponent,
                    newString,
                    oldString,
                    self.useLongestToken,
                ),
            )
        }

        let minDiagonalToConsider = -Infinity
        let maxDiagonalToConsider = Infinity

        // Main worker method. checks all permutations of a given edit length for acceptance.
        function execEditLength(): PathComponent[] | undefined {
            for (
                let diagonalPath = Math.max(minDiagonalToConsider, -editLength);
                diagonalPath <= Math.min(maxDiagonalToConsider, editLength);
                diagonalPath += 2
            ) {
                let basePath: Path
                const removePath = bestPath[diagonalPath - 1]
                const addPath = bestPath[diagonalPath + 1]
                if (removePath) {
                    bestPath[diagonalPath - 1] = undefined!
                }

                let canAdd = false
                if (addPath) {
                    const addPathNewPos = addPath.oldPos - diagonalPath
                    canAdd =
                        addPath && 0 <= addPathNewPos && addPathNewPos < newLen
                }

                const canRemove = removePath && removePath.oldPos + 1 < oldLen
                if (!canAdd && !canRemove) {
                    bestPath[diagonalPath] = undefined!
                    continue
                }

                if (
                    !canRemove ||
                    (canAdd && removePath.oldPos < addPath.oldPos)
                ) {
                    basePath = self.addToPath(addPath, true, false, 0, options)
                } else {
                    basePath = self.addToPath(
                        removePath,
                        false,
                        true,
                        1,
                        options,
                    )
                }

                newPos = self.extractCommon(
                    basePath,
                    newString,
                    oldString,
                    diagonalPath,
                    options,
                )

                if (basePath.oldPos + 1 >= oldLen && newPos + 1 >= newLen) {
                    return done(
                        buildValues(
                            self,
                            basePath.lastComponent,
                            newString,
                            oldString,
                            self.useLongestToken,
                        ),
                    )
                }
                bestPath[diagonalPath] = basePath
                if (basePath.oldPos + 1 >= oldLen) {
                    maxDiagonalToConsider = Math.min(
                        maxDiagonalToConsider,
                        diagonalPath - 1,
                    )
                }
                if (newPos + 1 >= newLen) {
                    minDiagonalToConsider = Math.max(
                        minDiagonalToConsider,
                        diagonalPath + 1,
                    )
                }
            }

            editLength++
        }

        while (
            editLength <= maxEditLength &&
            Date.now() <= abortAfterTimestamp
        ) {
            const ret = execEditLength()
            if (ret) {
                return ret
            }
        }
    }

    addToPath(
        path: Path,
        added: boolean,
        removed: boolean,
        oldPosInc: number,
        options: Options,
    ): Path {
        const last = path.lastComponent
        if (
            last &&
            !options.oneChangePerToken &&
            last.added === added &&
            last.removed === removed
        ) {
            return {
                oldPos: path.oldPos + oldPosInc,
                lastComponent: {
                    count: last.count + 1,
                    added,
                    removed,
                    value: '',
                    previousComponent: last.previousComponent,
                },
            }
        }
        return {
            oldPos: path.oldPos + oldPosInc,
            lastComponent: {
                count: 1,
                added,
                removed,
                value: '',
                previousComponent: last,
            },
        }
    }

    extractCommon(
        basePath: Path,
        newString: string[],
        oldString: string[],
        diagonalPath: number,
        options: Options,
    ): number {
        const newLen = newString.length
        const oldLen = oldString.length
        let oldPos = basePath.oldPos
        let newPos = oldPos - diagonalPath

        let commonCount = 0
        while (
            newPos + 1 < newLen &&
            oldPos + 1 < oldLen &&
            this.equals(oldString[oldPos + 1], newString[newPos + 1], options)
        ) {
            newPos++
            oldPos++
            commonCount++
            if (options.oneChangePerToken) {
                basePath.lastComponent = {
                    count: 1,
                    previousComponent: basePath.lastComponent,
                    added: false,
                    removed: false,
                    value: '',
                }
            }
        }

        if (commonCount && !options.oneChangePerToken) {
            basePath.lastComponent = {
                count: commonCount,
                previousComponent: basePath.lastComponent,
                added: false,
                removed: false,
                value: '',
            }
        }

        basePath.oldPos = oldPos
        return newPos
    }

    equals(left: string, right: string, options: Options): boolean {
        if (options.comparator) {
            return options.comparator(left, right)
        }
        return (
            left === right ||
            !!(options.ignoreCase && left.toLowerCase() === right.toLowerCase())
        )
    }

    removeEmpty(array: string[]): string[] {
        const ret: string[] = []
        for (let i = 0; i < array.length; i++) {
            if (array[i]) {
                ret.push(array[i])
            }
        }
        return ret
    }

    castInput(value: string): string {
        return value
    }

    tokenize(value: string): string[] {
        return Array.from(value)
    }

    join(chars: string[]): string {
        return chars.join('')
    }

    postProcess(changeObjects: PathComponent[]): PathComponent[] {
        return changeObjects
    }
}

function buildValues(
    diff: Diff,
    lastComponentArg: PathComponent | undefined,
    newString: string[],
    oldString: string[],
    useLongestToken: boolean,
): PathComponent[] {
    const components: PathComponent[] = []
    let nextComponent: PathComponent | undefined
    let lastComponent = lastComponentArg

    while (lastComponent) {
        components.push(lastComponent)
        nextComponent = lastComponent.previousComponent
        delete lastComponent.previousComponent
        lastComponent = nextComponent
    }

    components.reverse()

    let componentPos = 0
    const componentLen = components.length
    let newPos = 0
    let oldPos = 0

    for (; componentPos < componentLen; componentPos++) {
        const component = components[componentPos]
        if (!component.removed) {
            if (!component.added && useLongestToken) {
                let value = newString.slice(newPos, newPos + component.count)
                value = value.map((value, i) => {
                    const oldValue = oldString[oldPos + i]
                    return oldValue.length > value.length ? oldValue : value
                })

                component.value = diff.join(value)
            } else {
                component.value = diff.join(
                    newString.slice(newPos, newPos + component.count),
                )
            }
            newPos += component.count

            if (!component.added) {
                oldPos += component.count
            }
        } else {
            component.value = diff.join(
                oldString.slice(oldPos, oldPos + component.count),
            )
            oldPos += component.count
        }
    }

    return components
}

export function diffChars(
    oldStr: string,
    newStr: string,
    options?: Options,
): PathComponent[] | undefined {
    return new Diff().diff(oldStr, newStr, options)
}
