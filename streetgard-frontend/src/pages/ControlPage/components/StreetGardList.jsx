import { streetgard_list, streetgard_data_species_latest } from '@/apis/core';
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import CreateNewGuard from './CreateNewGuard';
import { 
  CalendarIcon, 
  ThermometerIcon, 
  MapPinIcon, 
  CloudRainIcon, 
  SunIcon, 
  BoltIcon, 
  EyeIcon, 
  ToggleLeftIcon, 
  MoonIcon,
  ActivityIcon,
  BarChart3Icon,
  InfoIcon,
  RefreshCwIcon,
  LightbulbIcon,
  CameraIcon,
  CameraOffIcon,
  WrenchIcon,
  HandIcon
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Analysis from '@/pages/Analysis/Analysis';

const StreetGardList = () => {
  const [streetGardData, setStreetGardData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const [latestData, setLatestData] = useState(null)
  const [fetchingLatest, setFetchingLatest] = useState(false)
  const [activeTab, setActiveTab] = useState('sensors')
  const [showAddForm, setShowAddForm] = useState(false)

  const [manualControl, setManualControl] = useState(false)

  const navigate = useNavigate()

  const location = useLocation()
  const openModalId = new URLSearchParams(location.search).get('id')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await streetgard_list()
        setStreetGardData(response.data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching street gard data:", error)
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  useEffect(() => {
    if (latestData?.bulb_state) {
      setManualControl(false)
    }
  }, [latestData])

  useEffect(() => {
    if (openModalId) {
      const record = streetGardData.find(item => item.id === parseInt(openModalId))
      if (record) {
        handleCardClick(record)
        navigate(location.pathname)
      }
    }
  }, [openModalId, streetGardData])

  const handleCardClick = async (record) => {
    setSelectedRecord(record)
    setOpenModal(true)
    setFetchingLatest(true)
    
    try {
      const response = await streetgard_data_species_latest(record.id)
      setLatestData(response.data[0] || null)
    } catch (error) {
      console.error("Error fetching latest data:", error)
    } finally {
      setFetchingLatest(false)
    }
  }

  const handleNewDeviceAdded = (newDevice) => {
    setStreetGardData(prevData => [newDevice, ...prevData]);
    setShowAddForm(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] w-full">
        <div className="animate-spin mb-4">
          <RefreshCwIcon size={36} className="text-primary" />
        </div>
        <p className="text-lg font-medium">Loading street guard data...</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col space-y-6 p-4">
        {showAddForm && (
          <div className="mb-6">
            <CreateNewGuard onSuccess={handleNewDeviceAdded} />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {streetGardData.map((item) => (
            <Card 
              key={item.id} 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden group"
              onClick={() => handleCardClick(item)}
            >
              <div className="relative h-52 w-full bg-gradient-to-br from-secondary/30 to-background flex items-center justify-center overflow-hidden">
                {item.img ? (
                  <img 
                    src={item.img} 
                    alt={`${item.name} image`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className={`text-5xl transition-all duration-700 ${item.latest_bulb_status ? 'text-yellow-400 animate-pulse' : 'text-gray-400'}`}>
                    {item.latest_bulb_status ? (
                      <div className="relative">
                        <div className="absolute inset-0 bg-yellow-300/20 rounded-full blur-xl animate-pulse"></div>
                        <LightbulbIcon size={80} className="relative z-10" />
                      </div>
                    ) : (
                      <LightbulbIcon size={80} />
                    )}
                  </div>
                )}
                <Badge 
                  className="absolute top-3 right-3 shadow-md"
                >
                  ID: {item.id}
                </Badge>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-3 w-full">
                  <h3 className="font-bold text-lg text-foreground text-center">{item.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
                    <CalendarIcon size={12} />
                    {formatDate(item.created_time)}
                  </p>
                </div>
              </div>
              <CardContent className="pb-2">
                <div className="flex flex-col items-center justify-between gap-2">
                  <Badge variant={item.latest_bulb_status ? "success" : "secondary"} className="flex items-center gap-1">
                    {item.latest_bulb_status ? (
                      <>
                        <SunIcon size={12} className="animate-pulse" /> Active
                      </>
                    ) : (
                      <>
                        <MoonIcon size={12} /> Inactive
                      </>
                    )}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CalendarIcon size={12} />
                    Updated: {formatDate(item?.latest_updated_time)}
                  </Badge>
                </div>
              </CardContent>
              <div className="px-4 pb-4">
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        {selectedRecord && (
          <DialogContent className="min-w-[90vw] md:w-[90vw] w-[95vw] overflow-hidden max-h-[95vh] h-full p-0">
            <div className="sticky top-0 z-20 bg-background p-4 md:p-6 border-b">
              <DialogHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <DialogTitle className="text-xl md:text-2xl">{selectedRecord.name}</DialogTitle>
                    <DialogDescription className="text-sm">
                      Device data recorded on {formatDate(latestData?.created_time)}
                    </DialogDescription>
                  </div>
                  <Badge 
                    variant={latestData?.bulb_state ? "success" : "secondary"} 
                    className="text-md px-3 py-1 h-auto self-start md:self-auto"
                  >
                    {latestData?.bulb_state ? "ONLINE" : "OFFLINE"}
                  </Badge>
                </div>
              </DialogHeader>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-250px)]">
              <Tabs defaultValue="sensors" className="w-full" onValueChange={setActiveTab} value={activeTab}>
                <div className="sticky top-0 z-10 bg-background px-3 md:px-4 pt-3 pb-2">
                  <div className="overflow-x-auto no-scrollbar">
                    <TabsList className="inline-flex w-auto min-w-full gap-4">
                      <TabsTrigger value="sensors" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm whitespace-nowrap">
                        <ActivityIcon size={14} />
                        <span>Sensors</span>
                      </TabsTrigger>
                      <TabsTrigger value="device_control" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm whitespace-nowrap">
                        <WrenchIcon size={14} />
                        <span>Control</span>
                      </TabsTrigger>
                      <TabsTrigger value="info" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm whitespace-nowrap">
                        <InfoIcon size={14} />
                        <span>Info</span>
                      </TabsTrigger>
                      <TabsTrigger value="camera" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm whitespace-nowrap">
                        <CameraIcon size={14} />
                        <span>Camera</span>
                      </TabsTrigger>
                      <TabsTrigger value="analysis" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm whitespace-nowrap">
                        <BarChart3Icon size={14} />
                        <span>Analysis</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>
                
                <div className="px-3 md:px-4 pb-3">
                  <TabsContent value="sensors" className="mt-2">
                    {fetchingLatest ? (
                      <div className="flex flex-col justify-center items-center h-64">
                        <div className="animate-spin mb-4">
                          <RefreshCwIcon size={36} className="text-primary" />
                        </div>
                        <p className="text-lg">Loading latest sensor data...</p>
                      </div>
                    ) : latestData ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <ThermometerIcon className="text-primary" size={18} />
                                Temperature & Humidity
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">Temperature (DHT)</span>
                                  <span className="text-sm font-medium">{latestData.temp_dht}°C</span>
                                </div>
                                <Progress value={Math.min(100, (latestData.temp_dht / 50) * 100)} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">Temperature (BMP)</span>
                                  <span className="text-sm font-medium">{latestData.temp_bmp}°C</span>
                                </div>
                                <Progress value={Math.min(100, (latestData.temp_bmp / 50) * 100)} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">Humidity</span>
                                  <span className="text-sm font-medium">{latestData.humidity_dht}%</span>
                                </div>
                                <Progress value={latestData.humidity_dht} className="h-2" />
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <BarChart3Icon className="text-primary" size={18} />
                                Pressure & Altitude
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">Pressure</span>
                                  <span className="text-sm font-medium">{latestData.pressure_bmp} hPa</span>
                                </div>
                                <Progress value={Math.min(100, (latestData.pressure_bmp / 1100) * 100)} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">Altitude</span>
                                  <span className="text-sm font-medium">{latestData.altitude_bmp} m</span>
                                </div>
                                <Progress value={Math.min(100, (latestData.altitude_bmp / 1000) * 100)} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">Relative Height</span>
                                  <span className="text-sm font-medium">{latestData.relativeheight_bmp} m</span>
                                </div>
                                <Progress value={Math.min(100, (latestData.relativeheight_bmp / 100) * 100)} className="h-2" />
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <CloudRainIcon className="text-primary" size={18} />
                                Weather & Location
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Rain Sensor</span>
                                <Badge variant={latestData.rainsensor < 2000 ? "destructive" : "outline"}>
                                  {latestData.rainsensor < 2000 ? "Rain Detected" : "No Rain"} ({Math.round((4095 - latestData.rainsensor) / 4095 * 100)}%)
                                </Badge>
                              </div>
                              
                              <div className="pt-2">
                                <h4 className="font-medium mb-2">Location</h4>
                                {latestData.latitude_gsm !== 0 && latestData.longitude_gsm !== 0 ? (
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <MapPinIcon size={16} className="text-primary" />
                                      <span>
                                        Lat: {latestData.latitude_gsm?.toFixed(6)}, Lng: {latestData.longitude_gsm?.toFixed(6)}
                                      </span>
                                    </div>
                                    <Button 
                                      onClick={() => window.open(`https://google.com/maps?q=${latestData.latitude_gsm},${latestData.longitude_gsm}`, '_blank')} 
                                      className="w-full"
                                      variant="outline"
                                    >
                                      <MapPinIcon size={16} className="mr-2" />
                                      Open in Google Maps
                                    </Button>
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground">Location data not available</p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <BoltIcon className="text-primary" size={18} />
                                Device States
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col items-center justify-center p-3 rounded-lg border bg-card">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${latestData.bulb_state ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-secondary/20'}`}>
                                    <LightbulbIcon 
                                      size={24} 
                                      className={`${latestData.bulb_state ? 'text-yellow-500 animate-pulse' : 'text-muted-foreground'}`} 
                                    />
                                  </div>
                                  <span className="font-medium">Bulb</span>
                                  <Badge variant={latestData.bulb_state ? "success" : "secondary"} className="mt-1">
                                    {latestData.bulb_state ? "ON" : "OFF"}
                                  </Badge>
                                </div>
                                
                                <div className="flex flex-col items-center justify-center p-3 rounded-lg border bg-card">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${latestData.servo_state ? 'bg-primary/20' : 'bg-secondary/20'}`}>
                                    <ActivityIcon 
                                      size={24} 
                                      className={`${latestData.servo_state ? 'text-primary' : 'text-muted-foreground'}`} 
                                    />
                                  </div>
                                  <span className="font-medium">Servo</span>
                                  <Badge variant={latestData.servo_state ? "success" : "secondary"} className="mt-1">
                                    {latestData.servo_state ? "ON" : "OFF"}
                                  </Badge>
                                </div>
                                
                                <div className="flex flex-col items-center justify-center p-3 rounded-lg border bg-card">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${latestData.pir_state ? 'bg-primary/20' : 'bg-secondary/20'}`}>
                                    <EyeIcon 
                                      size={24} 
                                      className={`${latestData.pir_state ? 'text-primary' : 'text-muted-foreground'}`} 
                                    />
                                  </div>
                                  <span className="font-medium">PIR</span>
                                  <Badge variant={latestData.pir_state ? "success" : "secondary"} className="mt-1">
                                    {latestData.pir_state ? "ON" : "OFF"}
                                  </Badge>
                                </div>
                                
                                <div className="flex flex-col items-center justify-center p-3 rounded-lg border bg-card">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${latestData.relay_state ? 'bg-primary/20' : 'bg-secondary/20'}`}>
                                    <BoltIcon 
                                      size={24} 
                                      className={`${latestData.relay_state ? 'text-primary' : 'text-muted-foreground'}`} 
                                    />
                                  </div>
                                  <span className="font-medium">Relay</span>
                                  <Badge variant={latestData.relay_state ? "success" : "secondary"} className="mt-1">
                                    {latestData.relay_state ? "ON" : "OFF"}
                                  </Badge>
                                </div>
                                
                                <div className="flex flex-col items-center justify-center p-3 rounded-lg border bg-card">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${latestData.ldr_state ? 'bg-primary/20' : 'bg-secondary/20'}`}>
                                    <SunIcon 
                                      size={24} 
                                      className={`${latestData.ldr_state ? 'text-primary' : 'text-muted-foreground'}`} 
                                    />
                                  </div>
                                  <span className="font-medium">LDR</span>
                                  <Badge variant={latestData.ldr_state ? "success" : "secondary"} className="mt-1">
                                    {latestData.ldr_state ? "ON" : "OFF"}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-64">
                        <p className="text-muted-foreground">No sensor data available</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="device_control" className="mt-2">
                    <Card>
                      <CardContent className="space-y-6 p-3 md:p-6">
                        <div className="space-y-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                              <h3 className="font-medium text-lg">Operation Mode</h3>
                              <p className="text-sm text-muted-foreground">
                                Switch between automated and manual control
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant={manualControl ? "default" : "outline"}
                                className="flex-1 md:min-w-[120px]"
                                onClick={() => {
                                  fetch(`${selectedRecord.api_url}/toggle_automated`)
                                    .then(res => res.text())
                                    .then(() => handleCardClick(selectedRecord))
                                    .catch(err => console.error("Error toggling mode:", err));
                                }}
                              >
                                <ActivityIcon size={16} className="mr-2" />
                                Automated
                              </Button>
                              <Button 
                                variant={manualControl ? "default" : "outline"}
                                className="flex-1 md:min-w-[120px]"
                                onClick={() => {
                                  fetch(`${selectedRecord.api_url}/toggle_automated`)
                                    .then(res => res.text())
                                    .then(() => handleCardClick(selectedRecord))
                                    .catch(err => console.error("Error toggling mode:", err));
                                }}
                              >
                                <HandIcon size={16} className="mr-2" />
                                Manual
                              </Button>
                            </div>
                          </div>
                          <div className="bg-secondary/20 p-3 md:p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {latestData?.automated_mode ? (
                                <>
                                  <ActivityIcon size={20} className="text-primary" />
                                  <span className="font-medium">Automated Mode Active</span>
                                </>
                              ) : (
                                <>
                                  <HandIcon size={20} className="text-primary" />
                                  <span className="font-medium">Manual Mode Active</span>
                                </>
                              )}
                            </div>
                            <Badge variant={latestData?.automated_mode ? "outline" : "secondary"}>
                              {latestData?.automated_mode ? "AI-Controlled" : "User-Controlled"}
                            </Badge>
                          </div>
                        </div>

                        {true ? (
                          <div className="space-y-4 border-t pt-4">
                            <h3 className="font-medium text-lg">Manual Controls</h3>
                            
                            {/* Light Control */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Card className="border-2 border-primary/20">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <LightbulbIcon size={16} className="text-primary" />
                                    Light Control
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex flex-col items-center gap-4">
                                    <div className="relative w-24 h-24 flex items-center justify-center">
                                      {latestData?.bulb_state ? (
                                        <div className="absolute inset-0 bg-yellow-300/20 rounded-full animate-pulse"></div>
                                      ) : null}
                                      <LightbulbIcon 
                                        size={64} 
                                        className={latestData?.bulb_state ? "text-yellow-400" : "text-muted-foreground"}
                                      />
                                    </div>
                                    <Button 
                                      variant={latestData?.bulb_state ? "default" : "outline"}
                                      className="w-full"
                                      onClick={() => {
                                        fetch(`${selectedRecord.api_url}/toggle_light`)
                                          .then(res => res.text())
                                          .then(() => handleCardClick(selectedRecord))
                                          .catch(err => console.error("Error toggling light:", err));
                                      }}
                                    >
                                      {latestData?.bulb_state ? "Turn Off Light" : "Turn On Light"}
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                              
                              {true && (
                                <Card className="border-2 border-primary/20">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2">
                                      <SunIcon size={16} className="text-primary" />
                                      Brightness Control
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="flex flex-col items-center gap-4">
                                      <div className="relative w-24 h-24 flex items-center justify-center">
                                        <SunIcon
                                          size={64} 
                                          className={latestData?.servo_position > 90 ? "text-yellow-400" : "text-muted-foreground"}
                                        />
                                      </div>
                                      <Button 
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                          fetch(`${selectedRecord.api_url}/toggle_dim`)
                                            .then(res => res.text())
                                            .then(() => handleCardClick(selectedRecord))
                                            .catch(err => console.error("Error toggling dimmer:", err));
                                        }}
                                      >
                                        {latestData?.servo_position > 90 ? "Dim Light" : "Brighten Light"}
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-secondary/10 p-6 rounded-lg text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="bg-primary/10 p-3 rounded-full">
                                <ActivityIcon size={32} className="text-primary" />
                              </div>
                              <h3 className="font-medium text-lg">Automated Mode Active</h3>
                              <p className="text-muted-foreground max-w-md mx-auto">
                                The device is currently operating autonomously based on environmental sensors.
                                Switch to manual mode to control the light and brightness directly.
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="info" className="mt-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Device Information</CardTitle>
                        <CardDescription>Details about your Street Guard device</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="h-48 w-full md:w-48 bg-secondary/20 flex items-center justify-center rounded-lg">
                              {selectedRecord.img ? (
                                <img 
                                  src={selectedRecord.img} 
                                  alt={`${selectedRecord.name} image`} 
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="text-6xl text-primary">
                                  <SunIcon size={64} />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <span className="text-sm text-muted-foreground">Device Name</span>
                                  <p className="font-medium">{selectedRecord.name}</p>
                                </div>
                                <div>
                                  <span className="text-sm text-muted-foreground">Device ID</span>
                                  <p className="font-medium">{selectedRecord.id}</p>
                                </div>
                                <div>
                                  <span className="text-sm text-muted-foreground">Created On</span>
                                  <p className="font-medium">{formatDate(selectedRecord.created_time)}</p>
                                </div>
                                <div>
                                  <span className="text-sm text-muted-foreground">Last Updated</span>
                                  <p className="font-medium">{formatDate(selectedRecord.latest_updated_time)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t">
                            <h3 className="font-medium mb-2">Device UUID</h3>
                            <div className="bg-secondary/10 p-3 rounded-md font-mono text-sm break-all">
                              {selectedRecord.uuid}
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t">
                            <h3 className="font-medium mb-2">Additional Information</h3>
                            <p className="text-muted-foreground">
                              This Street Guard device is equipped with multiple sensors to monitor environmental conditions and control connected devices.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="camera" className="mt-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Live Camera Feed</CardTitle>
                        <CardDescription>Real-time view from your Street Guard device</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {"https://streamsync-7yp3.onrender.com/live/c76ae9ba" ? (
                          <div className="relative rounded-lg overflow-hidden h-90">
                            <img 
                              src="https://streamsync-7yp3.onrender.com/live/c76ae9ba" 
                              alt="Live camera feed" 
                              className="w-full h-full object-cover rounded-lg" 
                            />
                            <Badge className="absolute top-3 right-3 px-3 py-1">
                              LIVE
                            </Badge>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="relative rounded-lg overflow-hidden h-80 bg-secondary/10">
                              <img 
                                src="https://images.unsplash.com/photo-1542662565-7e4b66bae529?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                                alt="Street view placeholder" 
                                className="w-full h-full object-cover rounded-lg opacity-70" 
                              />
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50">
                                <CameraOffIcon size={48} className="text-muted-foreground mb-2" />
                                <p className="text-lg font-medium">Camera feed unavailable</p>
                                <p className="text-sm text-muted-foreground">The device camera is currently offline</p>
                              </div>
                            </div>
                            <Button variant="outline" className="w-full">
                              <RefreshCwIcon size={16} className="mr-2" />
                              Try Again
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analysis" className="mt-2">
                    <Card>
                      <CardContent className="px-4">
                        <Analysis 
                          id={selectedRecord.id}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
            
            <div className="sticky bottom-0 z-20 bg-background border-t p-3 md:p-4 flex flex-col md:flex-row justify-between items-center gap-2">
              <Button variant="outline" onClick={() => setOpenModal(false)} className="w-full md:w-auto">Close</Button>
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <span className="text-xs md:text-sm text-muted-foreground hidden md:inline">
                  {fetchingLatest ? 'Refreshing...' : 'Last refreshed: ' + new Date().toLocaleTimeString()}
                </span>
                <Button 
                  onClick={() => handleCardClick(selectedRecord)} 
                  disabled={fetchingLatest}
                  className="gap-2 w-full md:w-auto"
                >
                  <RefreshCwIcon size={16} className={fetchingLatest ? 'animate-spin' : ''} />
                  Refresh Data
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
};

export default StreetGardList;