import * as React from "react"
import { AreaChart as AreaChartPrimitive, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const AreaChart = React.forwardRef(({ className, data, ...props }, ref) => (
  <div ref={ref} className={className}>
    <ResponsiveContainer width="100%" height={350}>
      <AreaChartPrimitive data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} {...props}>
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        {props.children}
      </AreaChartPrimitive>
    </ResponsiveContainer>
  </div>
))
AreaChart.displayName = "AreaChart"

export { AreaChart, Area } 