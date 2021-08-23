import React, {Component, ReactNode} from 'react'

import css from './DonutKeyMetricStat.less'

type Props = {
    value: number
    maxValue: number
    fill: string
    formattedValue: string
    label: string
    width: number
    height: number
    innerRadius: number
    outerRadius: number
    differenceComponent: ReactNode
    total: number | null
    startAngle: number
}

export default class DonutKeyMetricStat extends Component<Props> {
    static defaultProps: Pick<
        Props,
        | 'height'
        | 'width'
        | 'outerRadius'
        | 'innerRadius'
        | 'total'
        | 'startAngle'
    > = {
        height: 320,
        width: 320,
        outerRadius: 0.95, // of the width
        innerRadius: 0.83, // of the width
        total: null,
        startAngle: 0,
    }

    render() {
        const {width, height, differenceComponent, formattedValue} = this.props

        return (
            <div className={css.container}>
                <svg className={css.donut} viewBox={`0 0 ${width} ${height}`}>
                    {this._renderPaths()}
                </svg>
                <div className={css.difference}>
                    <div className={css.value}>{formattedValue}</div>
                    <div>{differenceComponent}</div>
                </div>
            </div>
        )
    }

    _renderPaths() {
        const {fill, maxValue, value} = this.props
        let index = 0
        let startAngle = parseFloat(270 as any)

        if (!value) {
            // using arcs we can't render a fully filled figured, but we can fill it for 99.99%
            return [
                this._renderPath(
                    index,
                    maxValue * 0.9999,
                    maxValue,
                    startAngle,
                    'empty',
                    true
                ),
            ]
        }

        if (value === maxValue) {
            return this._renderPath(
                index,
                value * 0.9999,
                maxValue,
                startAngle,
                fill,
                true
            )
        }

        const fullPath = this._renderPath(
            index,
            value,
            maxValue,
            startAngle,
            fill
        )
        index += 1

        startAngle += (value / maxValue) * 360

        const emptyPath = this._renderPath(
            index,
            maxValue - value,
            maxValue,
            startAngle
        )

        return [fullPath, emptyPath]
    }

    _renderPath = (
        index: number,
        value: number,
        total: number,
        startAngle: number,
        fillType = 'empty',
        single = false
    ) => {
        const d = this._getPathData(
            value,
            total,
            startAngle,
            this.props.width,
            this.props.innerRadius,
            this.props.outerRadius,
            fillType === 'empty',
            single
        )

        return <path key={index} className={css[`path-${fillType}`]} d={d} />
    }

    _getPathData = (
        data: number,
        total: number,
        startAngle: number,
        width: number,
        innerRadius: number,
        outerRadius: number,
        reverse = false,
        single = false
    ) => {
        const activeAngle = (data / total) * 360
        const endAngle = startAngle + activeAngle

        const largeArcFlagOuter = activeAngle > 180 ? '1 1' : '0 1'
        const largeArcFlagInner = activeAngle > 180 ? '1 0' : '0 0'
        const half = width / 2

        const outerCoords = this._getCoordinates(
            half,
            outerRadius,
            startAngle,
            endAngle
        )
        const innerCoords = this._getCoordinates(
            half,
            innerRadius,
            startAngle,
            endAngle
        )

        let pathData = `M${outerCoords.x1},${outerCoords.y1}
          ${this._getArc(
              width,
              outerRadius,
              largeArcFlagOuter,
              parseFloat(outerCoords.x2),
              parseFloat(outerCoords.y2)
          )}`

        if (!single) {
            if (reverse) {
                pathData += this._getArc(
                    (outerRadius - innerRadius) * width,
                    0.3,
                    largeArcFlagInner,
                    parseFloat(innerCoords.x2),
                    parseFloat(innerCoords.y2)
                )
            } else {
                pathData += this._getArc(
                    (outerRadius - innerRadius) * width,
                    0.3,
                    largeArcFlagOuter,
                    parseFloat(innerCoords.x2),
                    parseFloat(innerCoords.y2)
                )
            }
        } else {
            pathData += `L${innerCoords.x2},${innerCoords.y2}`
        }

        pathData += this._getArc(
            width,
            innerRadius,
            largeArcFlagInner,
            parseFloat(innerCoords.x1),
            parseFloat(innerCoords.y1)
        )

        if (!single) {
            if (reverse) {
                pathData += this._getArc(
                    (outerRadius - innerRadius) * width,
                    0.3,
                    largeArcFlagInner,
                    parseFloat(outerCoords.x1),
                    parseFloat(outerCoords.y1)
                )
            } else {
                pathData += this._getArc(
                    (outerRadius - innerRadius) * width,
                    0.3,
                    largeArcFlagOuter,
                    parseFloat(outerCoords.x1),
                    parseFloat(outerCoords.y1)
                )
            }
        } else {
            pathData += ' z'
        }

        return pathData
    }

    _getCoordinates = (
        half: number,
        radius: number,
        startAngle: number,
        endAngle: number
    ) => {
        const x1 = this._toFixed(
            half + half * radius * Math.cos((Math.PI * startAngle) / 180)
        )
        const y1 = this._toFixed(
            half + half * radius * Math.sin((Math.PI * startAngle) / 180)
        )
        const x2 = this._toFixed(
            half + half * radius * Math.cos((Math.PI * endAngle) / 180)
        )
        const y2 = this._toFixed(
            half + half * radius * Math.sin((Math.PI * endAngle) / 180)
        )

        return {x1, y1, x2, y2}
    }

    _getArc = (
        width: number,
        radius: number,
        largeArcFlag: string,
        x: number,
        y: number
    ) => {
        const z = this._toFixed((width / 2) * radius)

        return `A${z},${z} 0 ${largeArcFlag} ${this._toFixed(
            x
        )},${this._toFixed(y)}`
    }

    _toFixed = (number: number, decimalPlaces = 2) => {
        return (Math.floor(number * 100) / 100).toFixed(decimalPlaces || 2)
    }
}
