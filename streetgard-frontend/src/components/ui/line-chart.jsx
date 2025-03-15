import * as React from "react"
import { LineChart as LineChartPrimitive, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const LineChart = React.forwardRef(({ className, data, ...props }, ref) => (
  <div ref={ref} className={className}>
    <ResponsiveContainer width="100%" height={350}>
      <LineChartPrimitive data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} {...props}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {props.children}
      </LineChartPrimitive>
    </ResponsiveContainer>
  </div>
))
LineChart.displayName = "LineChart"

export { LineChart, Line } 