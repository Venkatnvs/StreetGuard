import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { streetgard_create } from '@/apis/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { PlusIcon, CameraIcon, UploadIcon, RefreshCwIcon, CheckIcon, XIcon } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Device name must be at least 3 characters.",
  }),
  img: z.any().optional(),
});

const CreateNewGuard = ({ onSuccess }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      img: null,
    },
  });

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        form.setValue('img', file);
      };
      reader.readAsDataURL(file);
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Could not access camera. Please check permissions.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setIsCameraActive(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // Capture image from camera
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          // Create a File object from the blob
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          
          // Set preview image
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewImage(reader.result);
          };
          reader.readAsDataURL(blob);
          
          // Set form value
          form.setValue('img', file);
          
          // Switch to preview tab
          setActiveTab('preview');
          
          // Stop camera
          stopCamera();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value);
    
    // Start or stop camera based on tab
    if (value === 'camera') {
      startCamera();
    } else if (isCameraActive) {
      stopCamera();
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', data.name);
      
      if (data.img) {
        formData.append('img', data.img);
      }
      
      // Submit to API
      const response = await streetgard_create(formData);
      
      // Show success message
      toast.success("Street Guard device created successfully!");
      
      // Reset form
      form.reset();
      setPreviewImage(null);
      setActiveTab('upload');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error("Error creating Street Guard:", error);
      toast.error("Failed to create Street Guard device. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up camera when component unmounts
  React.useEffect(() => {
    return () => {
      if (isCameraActive) {
        stopCamera();
      }
    };
  }, [isCameraActive]);

  return (
    <div className='flex flex-col gap-4 py-4'>
        <Card className="w-full shadow-md">
        <CardHeader>
            <CardTitle className="text-xl">Add New Street Guard Device</CardTitle>
            <CardDescription>
            Enter the details for your new Street Guard device
            </CardDescription>
        </CardHeader>
        
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Device Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Enter device name" {...field} />
                    </FormControl>
                    <FormDescription>
                        Give your Street Guard device a unique name
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <div className="space-y-3">
                <Label>Device Image</Label>
                
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                        <UploadIcon size={14} />
                        <span>Upload</span>
                    </TabsTrigger>
                    <TabsTrigger value="camera" className="flex items-center gap-2">
                        <CameraIcon size={14} />
                        <span>Camera</span>
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center gap-2" disabled={!previewImage}>
                        <CheckIcon size={14} />
                        <span>Preview</span>
                    </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upload" className="mt-0">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-lg p-6 h-[200px]">
                        <Input
                        type="file"
                        accept="image/*"
                        id="image-upload"
                        className="hidden"
                        onChange={handleFileChange}
                        />
                        <Label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center cursor-pointer w-full h-full"
                        >
                        <UploadIcon size={40} className="text-muted-foreground mb-2" />
                        <span className="text-sm font-medium">Click to upload image</span>
                        <span className="text-xs text-muted-foreground mt-1">
                            JPG, PNG or GIF (max. 5MB)
                        </span>
                        </Label>
                    </div>
                    </TabsContent>
                    
                    <TabsContent value="camera" className="mt-0">
                    <div className="space-y-4">
                        <div className="relative w-full h-[200px] bg-black rounded-lg overflow-hidden">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        </div>
                        <Button
                        type="button"
                        className="w-full gap-2"
                        onClick={captureImage}
                        disabled={!isCameraActive}
                        >
                        <CameraIcon size={16} />
                        Capture Image
                        </Button>
                    </div>
                    </TabsContent>
                    
                    <TabsContent value="preview" className="mt-0">
                    {previewImage ? (
                        <div className="relative">
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="w-full h-[200px] object-cover rounded-lg"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8"
                            onClick={() => {
                            setPreviewImage(null);
                            form.setValue('img', null);
                            setActiveTab('upload');
                            }}
                        >
                            <XIcon size={16} />
                        </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-lg p-6 h-[200px]">
                        <span className="text-muted-foreground">No image selected</span>
                        </div>
                    )}
                    </TabsContent>
                </Tabs>
                </div>
                
                <div className="flex justify-end pt-4">
                <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="gap-2 bg-primary hover:bg-primary/90"
                >
                    {isSubmitting ? (
                    <>
                        <RefreshCwIcon size={16} className="animate-spin" />
                        Creating...
                    </>
                    ) : (
                    <>
                        <PlusIcon size={16} />
                        Create Device
                    </>
                    )}
                </Button>
                </div>
            </form>
            </Form>
        </CardContent>
        </Card>
    </div>
  );
};

export default CreateNewGuard;
