import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PropertyType, insertLandSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Save, MapPin, Upload, ArrowLeft, Check } from "lucide-react";

// Extend the insert schema with our form validation rules
const landRegistrationSchema = insertLandSchema.extend({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Please provide a more detailed description" }),
  area: z.coerce.number().min(1, { message: "Area must be greater than 0" }),
  address: z.string().min(5, { message: "Please provide a valid address" }),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  postalCode: z.string().optional(),
});

type LandRegistrationFormValues = z.infer<typeof landRegistrationSchema>;

export default function LandRegistration() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [_, navigate] = useLocation();

  // Set up form with our validation schema
  const form = useForm<LandRegistrationFormValues>({
    resolver: zodResolver(landRegistrationSchema),
    defaultValues: {
      title: "",
      description: "",
      area: undefined,
      address: "",
      city: "",
      state: "",
      postalCode: "",
      propertyType: PropertyType.RESIDENTIAL,
      isForSale: false,
      ownerId: user?.id || 0,
    },
  });

  // Handle document upload simulation
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // In a real application, we would upload to IPFS here
      // For now, just simulate the upload
      const newDocs = Array.from(e.target.files).map(file => file.name);
      
      toast({
        title: "Document uploaded",
        description: `${newDocs.join(", ")} uploaded successfully`,
      });
      
      setUploadedDocs([...uploadedDocs, ...newDocs]);
    }
  };

  // Handle form submission
  const onSubmit = async (values: LandRegistrationFormValues) => {
    try {
      if (step === 1) {
        if (await form.trigger(['title', 'propertyType', 'description', 'area', 'yearBuilt'])) {
          setStep(2);
        }
        return;
      } 
      
      if (step === 2) {
        if (await form.trigger(['address', 'city', 'state', 'postalCode'])) {
          setStep(3);
        }
        return;
      }
    
    if (uploadedDocs.length === 0) {
      toast({
        title: "Documents Required",
        description: "Please upload at least one document to verify your ownership",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Ensure ownerId is set
      values.ownerId = user?.id || 0;
      
      // Add documents info (in real app, these would be IPFS hashes)
      const dataToSubmit = {
        ...values,
        documents: uploadedDocs,
        location: { lat: 40.7128, lng: -74.0060 }, // Example coordinates - would be set by map in real app
      };
      
      await apiRequest("POST", "/api/lands", dataToSubmit);
      
      toast({
        title: "Registration Submitted",
        description: "Your land registration has been submitted for government verification.",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/lands/my'] });
      
      // Show success screen
      setRegistrationComplete(true);
      
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register land",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // If registration is complete, show success screen
  if (registrationComplete) {
    return (
      <DashboardLayout title="Land Registration">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-lg border-green-100 dark:border-green-900">
            <CardContent className="pt-6 pb-8 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Registration Submitted Successfully</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your land registration has been submitted and is pending government verification.
                You will be notified once the verification process is complete.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate("/dashboard/landowner")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <Button onClick={() => navigate("/dashboard/landowner/properties")}>
                  View My Properties
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Register Land Property">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="px-4 py-5 sm:px-6 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Property Registration Form</CardTitle>
                <CardDescription>
                  Step {step} of 3: {step === 1 ? "Property Details" : step === 2 ? "Location Information" : "Document Upload"}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
              </div>
            </div>
          </CardHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="px-4 py-5 sm:p-6">
                {step === 1 && (
                  <div className="grid grid-cols-6 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="col-span-6 sm:col-span-3">
                          <FormLabel>Property Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Residential Land Plot #123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem className="col-span-6 sm:col-span-3">
                          <FormLabel>Property Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select property type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={PropertyType.RESIDENTIAL}>Residential</SelectItem>
                              <SelectItem value={PropertyType.COMMERCIAL}>Commercial</SelectItem>
                              <SelectItem value={PropertyType.AGRICULTURAL}>Agricultural</SelectItem>
                              <SelectItem value={PropertyType.INDUSTRIAL}>Industrial</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="col-span-6">
                          <FormLabel>Property Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Provide detailed information about your property..."
                              className="resize-none"
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem className="col-span-6 sm:col-span-3">
                          <FormLabel>Area (sq.ft.)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" step="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="yearBuilt"
                      render={({ field }) => (
                        <FormItem className="col-span-6 sm:col-span-3">
                          <FormLabel>Year Built (if applicable)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Optional" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                {step === 2 && (
                  <div className="grid grid-cols-6 gap-6">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="col-span-6">
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Full street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem className="col-span-6 sm:col-span-2">
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem className="col-span-6 sm:col-span-2">
                          <FormLabel>State / Province</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem className="col-span-6 sm:col-span-2">
                          <FormLabel>ZIP / Postal code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="col-span-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Property Location on Map</label>
                      <div className="mt-1 border border-gray-300 dark:border-gray-700 rounded-md h-64 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <div className="text-gray-500 dark:text-gray-400 flex items-center flex-col">
                          <MapPin className="h-8 w-8 mb-2" />
                          <span>Map widget will be loaded here</span>
                          <span className="text-xs mt-1">Click on the map to set the exact coordinates of your property</span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        For demonstration purposes, default coordinates will be used.
                      </p>
                    </div>
                  </div>
                )}
                
                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Upload Property Documents
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
                        Please upload title deed, ID, and any other documents required to verify your ownership.
                        These documents will be stored securely on IPFS.
                      </p>
                      
                      <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600 dark:text-gray-400">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary hover:text-primary-600 focus-within:outline-none">
                              <span>Upload files</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                multiple
                                onChange={handleDocumentUpload}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PNG, JPG, PDF up to 10MB each
                          </p>
                        </div>
                      </div>
                      
                      {uploadedDocs.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Uploaded Documents:</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {uploadedDocs.map((doc, index) => (
                              <li key={index} className="text-sm text-gray-600 dark:text-gray-400">{doc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700 dark:text-yellow-200">
                            Your land registration will be reviewed by government officials for verification.
                            This process may take a few days.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-right sm:px-6 flex justify-between">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep((step - 1) as 1 | 2)}
                    disabled={submitting}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}
                <div className="ml-auto">
                  <Button
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {step === 3 ? "Submitting..." : "Saving..."}
                      </>
                    ) : (
                      <>
                        {step < 3 ? (
                          "Next"
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Submit Registration
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
