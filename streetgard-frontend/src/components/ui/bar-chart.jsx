import * as React from "react"
import { BarChart as BarChartPrimitive, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const BarChart = React.forwardRef(({ className, data, ...props }, ref) => (
  <div ref={ref} className={className}>
    <ResponsiveContainer width="100%" height={350}>
      <BarChartPrimitive data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} {...props}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        {props.children}
      </BarChartPrimitive>
    </ResponsiveContainer>
  </div>
))
BarChart.displayName = "BarChart"

export { BarChart, Bar } 