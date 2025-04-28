import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Land, LandStatus, PropertyType } from "@shared/schema";
import { MapPin, Ruler, User, CheckCircle, ExternalLink } from "lucide-react";
import { Link } from "wouter";

interface PropertyCardProps {
  property: Land;
  actionButton?: React.ReactNode;
  showStatus?: boolean;
  showOwner?: boolean;
}

export default function PropertyCard({ 
  property, 
  actionButton,
  showStatus = true,
  showOwner = false,
}: PropertyCardProps) {
  
  // Helper function to get status badge
  const getStatusBadge = (status: LandStatus) => {
    switch (status) {
      case LandStatus.PENDING:
        return <Badge variant="warning">Pending Approval</Badge>;
      case LandStatus.VERIFIED:
        return <Badge variant="success">Verified</Badge>;
      case LandStatus.REJECTED:
        return <Badge variant="error">Rejected</Badge>;
      case LandStatus.TRANSFER_PENDING:
        return <Badge variant="info">Transfer Pending</Badge>;
      default:
        return null;
    }
  };
  
  // Helper to get property type display
  const getPropertyTypeDisplay = (type: PropertyType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-start p-4">
          <div className="mr-4 flex-shrink-0">
            {/* Display property image based on type */}
            <div className="h-16 w-16 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
              {property.propertyType === PropertyType.RESIDENTIAL ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-gray-500">
                  <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                  <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                </svg>
              ) : property.propertyType === PropertyType.COMMERCIAL ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-gray-500">
                  <path fillRule="evenodd" d="M3 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5H15v-18a.75.75 0 000-1.5H3zM6.75 19.5v-2.25a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75zM6 6.75A.75.75 0 016.75 6h.75a.75.75 0 010 1.5h-.75A.75.75 0 016 6.75zM6.75 9a.75.75 0 000 1.5h.75a.75.75 0 000-1.5h-.75zM6 12.75a.75.75 0 01.75-.75h.75a.75.75 0 010 1.5h-.75a.75.75 0 01-.75-.75zM10.5 6a.75.75 0 000 1.5h.75a.75.75 0 000-1.5h-.75zm-.75 3.75A.75.75 0 0110.5 9h.75a.75.75 0 010 1.5h-.75a.75.75 0 01-.75-.75zM10.5 12a.75.75 0 000 1.5h.75a.75.75 0 000-1.5h-.75zM16.5 6.75v15h5.25a.75.75 0 000-1.5H21v-12a.75.75 0 000-1.5h-4.5zm1.5 4.5a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008zm.75 2.25a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75h-.008zM18 17.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" clipRule="evenodd" />
                </svg>
              ) : property.propertyType === PropertyType.AGRICULTURAL ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-gray-500">
                  <path d="M19.006 3.705a.75.75 0 00-.512-1.41L6 6.838V3a.75.75 0 00-.75-.75h-1.5A.75.75 0 003 3v4.93l-1.006.365a.75.75 0 00.512 1.41l16.5-6z" />
                  <path fillRule="evenodd" d="M3.019 11.115L18 5.667V9.09l4.006 1.456a.75.75 0 11-.512 1.41l-.494-.18v8.475h.75a.75.75 0 010 1.5H2.25a.75.75 0 010-1.5H3v-9.129l.019-.006zM18 20.25v-9.565l1.5.545v9.02H18zm-9-6a.75.75 0 00-.75.75v4.5c0 .414.336.75.75.75h3a.75.75 0 00.75-.75V15a.75.75 0 00-.75-.75H9z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-gray-500">
                  <path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 11-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
                  <path fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{property.title}</p>
              {showStatus && getStatusBadge(property.status)}
            </div>
            <div className="mt-2 flex justify-between">
              <div>
                <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
                  {property.address}, {property.city}
                </p>
                <p className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <Ruler className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
                  {property.area.toLocaleString()} sq.ft.
                </p>
                {showOwner && (
                  <p className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <User className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
                    Owner ID: {property.ownerId}
                  </p>
                )}
                <div className="mt-1 flex space-x-2">
                  <Badge variant="outline">{getPropertyTypeDisplay(property.propertyType)}</Badge>
                  {property.isForSale && (
                    <Badge variant="info">For Sale: {property.price ? `${property.price} ETH` : ''}</Badge>
                  )}
                  {property.tokenId && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span className="mono">Token #{property.tokenId}</span>
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                {actionButton || (
                  <Link href={`/land/${property.id}`}>
                    <Button size="sm" variant="outline" className="text-primary-700 bg-primary-100 border-primary-200 hover:bg-primary-200">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
