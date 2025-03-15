import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AreaChart, Area } from 'recharts';
import { BarChart, Bar } from 'recharts';
import { streetgard_data_list_specific_device } from '../../apis/core';
import { format } from 'date-fns';

// Custom tooltip component for smaller, more compact tooltips
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-2 rounded-md shadow-sm text-xs">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-1">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.name}: {entry.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Analysis = ({ id }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await streetgard_data_list_specific_device(id);

                // Format the data for charts - limit to last 20 entries for better mobile display
                const formattedData = response.data
                    .slice(-20) // Take only the last 20 entries
                    .map(item => ({
                        name: format(new Date(item.created_time), 'HH:mm'), // Shorter time format
                        temp_dht: item.temp_dht,
                        humidity_dht: item.humidity_dht,
                        temp_bmp: item.temp_bmp,
                        pressure_bmp: item.pressure_bmp,
                        altitude_bmp: item.altitude_bmp,
                        rainsensor: item.rainsensor,
                        pir: item.pir_state ? 1 : 0,
                        relay: item.relay_state ? 1 : 0,
                        ldr: item.ldr_state ? 1 : 0,
                        bulb: item.bulb_state ? 1 : 0,
                    }));

                setData(formattedData);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch data');
                setLoading(false);
                console.error('Error fetching data:', err);
            }
        };

        fetchData();
    }, [id]);

    if (!id) {
        return <div className="flex items-center justify-center h-64">No device selected</div>;
    }

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading data...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-64 text-red-500">{error}</div>;
    }

    if (data.length === 0) {
        return <div className="flex items-center justify-center h-64">No data available</div>;
    }

    // Common chart props for consistency
    const chartProps = {
        margin: { top: 5, right: 10, left: 0, bottom: 5 },
        height: 200
    };

    return (
        <div className="w-full p-0">
            <Tabs defaultValue="temperature">
                <div className="overflow-x-auto no-scrollbar">
                    <TabsList className="inline-flex w-auto min-w-full">
                        <TabsTrigger value="temperature" className="text-xs md:text-sm whitespace-nowrap">Temperature</TabsTrigger>
                        <TabsTrigger value="humidity" className="text-xs md:text-sm whitespace-nowrap">Humidity & Pressure</TabsTrigger>
                        <TabsTrigger value="altitude" className="text-xs md:text-sm whitespace-nowrap">Altitude & Rain</TabsTrigger>
                        <TabsTrigger value="sensors" className="text-xs md:text-sm whitespace-nowrap">Sensor States</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="temperature" className="space-y-4 mt-4">
                    <Card className="overflow-hidden">
                        <CardHeader className="p-3">
                            <CardTitle className="text-sm md:text-base">Temperature Readings</CardTitle>
                            <CardDescription className="text-xs">
                                DHT and BMP temperature sensors
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 pb-2">
                            <div className="w-full h-[180px] md:h-[220px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data} {...chartProps}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#88888833" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} tickMargin={5} />
                                        <YAxis tick={{ fontSize: 10 }} width={25} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                                        <Line type="monotone" dataKey="temp_dht" stroke="#8884d8" name="DHT (°C)" dot={false} />
                                        <Line type="monotone" dataKey="temp_bmp" stroke="#82ca9d" name="BMP (°C)" dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="humidity" className="space-y-4 mt-4">
                    <Card className="overflow-hidden">
                        <CardHeader className="p-3">
                            <CardTitle className="text-sm md:text-base">Humidity</CardTitle>
                            <CardDescription className="text-xs">
                                DHT humidity sensor
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 pb-2">
                            <div className="w-full h-[180px] md:h-[220px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data} {...chartProps}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#88888833" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} tickMargin={5} />
                                        <YAxis tick={{ fontSize: 10 }} width={25} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                                        <defs>
                                            <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                                            </linearGradient>
                                        </defs>
                                        <Area type="monotone" dataKey="humidity_dht" stroke="#8884d8" fillOpacity={1} fill="url(#colorHumidity)" name="Humidity (%)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="p-3">
                            <CardTitle className="text-sm md:text-base">Pressure</CardTitle>
                            <CardDescription className="text-xs">
                                BMP pressure sensor
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 pb-2">
                            <div className="w-full h-[180px] md:h-[220px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data} {...chartProps}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#88888833" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} tickMargin={5} />
                                        <YAxis tick={{ fontSize: 10 }} width={25} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                                        <defs>
                                            <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                                            </linearGradient>
                                        </defs>
                                        <Area type="monotone" dataKey="pressure_bmp" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPressure)" name="Pressure (hPa)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="altitude" className="space-y-4 mt-4">
                    <Card className="overflow-hidden">
                        <CardHeader className="p-3">
                            <CardTitle className="text-sm md:text-base">Altitude</CardTitle>
                            <CardDescription className="text-xs">
                                BMP altitude sensor
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 pb-2">
                            <div className="w-full h-[180px] md:h-[220px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data} {...chartProps}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#88888833" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} tickMargin={5} />
                                        <YAxis tick={{ fontSize: 10 }} width={25} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                                        <Line type="monotone" dataKey="altitude_bmp" stroke="#8884d8" name="Altitude (m)" dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="p-3">
                            <CardTitle className="text-sm md:text-base">Rain Sensor</CardTitle>
                            <CardDescription className="text-xs">
                                Rain detection readings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 pb-2">
                            <div className="w-full h-[180px] md:h-[220px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data} {...chartProps}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#88888833" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} tickMargin={5} />
                                        <YAxis tick={{ fontSize: 10 }} width={25} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                                        <defs>
                                            <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                                            </linearGradient>
                                        </defs>
                                        <Area type="monotone" dataKey="rainsensor" stroke="#82ca9d" fillOpacity={1} fill="url(#colorRain)" name="Rain Sensor" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sensors" className="space-y-4 mt-4">
                    <Card className="overflow-hidden">
                        <CardHeader className="p-3">
                            <CardTitle className="text-sm md:text-base">Sensor States</CardTitle>
                            <CardDescription className="text-xs">
                                Binary sensor states
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 pb-2">
                            <div className="w-full h-[180px] md:h-[220px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data} {...chartProps}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#88888833" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} tickMargin={5} />
                                        <YAxis tick={{ fontSize: 10 }} width={25} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                                        <Bar dataKey="pir" fill="#8884d8" name="PIR" />
                                        <Bar dataKey="relay" fill="#82ca9d" name="Relay" />
                                        <Bar dataKey="ldr" fill="#ffc658" name="LDR" />
                                        <Bar dataKey="bulb" fill="#ff8042" name="Bulb" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Analysis; 