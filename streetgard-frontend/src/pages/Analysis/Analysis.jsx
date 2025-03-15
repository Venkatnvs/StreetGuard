import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { LineChart, Line } from '../../components/ui/line-chart';
import { AreaChart, Area } from '../../components/ui/area-chart';
import { BarChart, Bar } from '../../components/ui/bar-chart';
import { streetgard_data_list_specific_device } from '../../apis/core';
import { format } from 'date-fns';

const Analysis = ({ id }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await streetgard_data_list_specific_device(id);

                // Format the data for charts
                const formattedData = response.data.map(item => ({
                    name: format(new Date(item.created_time), 'MM/dd HH:mm'),
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
    }, []);

    if (!id) {
        return <div className="flex items-center justify-center h-screen">No device selected</div>;
    }

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading data...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
    }

    if (data.length === 0) {
        return <div className="flex items-center justify-center h-screen">No data available</div>;
    }

    return (
        <div className="container mx-auto p-0">
            <Tabs defaultValue="temperature">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="temperature">Temperature</TabsTrigger>
                    <TabsTrigger value="humidity">Humidity & Pressure</TabsTrigger>
                    <TabsTrigger value="altitude">Altitude & Rain</TabsTrigger>
                    <TabsTrigger value="sensors">Sensor States</TabsTrigger>
                </TabsList>

                <TabsContent value="temperature" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Temperature Readings</CardTitle>
                            <CardDescription>
                                Comparison between DHT and BMP temperature sensors over time
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LineChart data={data}>
                                <Line type="monotone" dataKey="temp_dht" stroke="#8884d8" name="DHT Temperature (°C)" />
                                <Line type="monotone" dataKey="temp_bmp" stroke="#82ca9d" name="BMP Temperature (°C)" />
                            </LineChart>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="humidity" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Humidity Readings</CardTitle>
                            <CardDescription>
                                DHT humidity sensor readings over time
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AreaChart data={data}>
                                <Area type="monotone" dataKey="humidity_dht" stroke="#8884d8" fill="url(#colorUv)" name="Humidity (%)" />
                            </AreaChart>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pressure Readings</CardTitle>
                            <CardDescription>
                                BMP pressure sensor readings over time
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AreaChart data={data}>
                                <Area type="monotone" dataKey="pressure_bmp" stroke="#82ca9d" fill="url(#colorPv)" name="Pressure (hPa)" />
                            </AreaChart>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="altitude" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Altitude Readings</CardTitle>
                            <CardDescription>
                                BMP altitude sensor readings over time
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LineChart data={data}>
                                <Line type="monotone" dataKey="altitude_bmp" stroke="#8884d8" name="Altitude (m)" />
                            </LineChart>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Rain Sensor Readings</CardTitle>
                            <CardDescription>
                                Rain sensor readings over time
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AreaChart data={data}>
                                <Area type="monotone" dataKey="rainsensor" stroke="#82ca9d" fill="url(#colorPv)" name="Rain Sensor" />
                            </AreaChart>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sensors" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sensor States</CardTitle>
                            <CardDescription>
                                Binary sensor states over time
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BarChart data={data}>
                                <Bar dataKey="pir" fill="#8884d8" name="PIR Sensor" />
                                <Bar dataKey="relay" fill="#82ca9d" name="Relay State" />
                                <Bar dataKey="ldr" fill="#ffc658" name="LDR Sensor" />
                                <Bar dataKey="bulb" fill="#ff8042" name="Bulb State" />
                            </BarChart>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Analysis; 