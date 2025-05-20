export const secondsToHours = (s: number) => s / 60 / 60

export const calculateMetricPerHour = (metric: number, seconds: number) =>
    seconds === 0 ? 0 : metric / secondsToHours(seconds)
