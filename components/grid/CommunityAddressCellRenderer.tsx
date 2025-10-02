import { MapPin } from 'lucide-react';

interface CommunityAddressCellRendererProps {
  data: any;
  communities?: Array<{
    community_id: string;
    description: string;
    address1?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
  }>;
}

export const CommunityAddressCellRenderer = ({ data, communities }: CommunityAddressCellRendererProps) => {
  const community = communities?.find(c => c.community_id === data?.community_id);
  
  if (!community) {
    return <span className="text-muted-foreground text-xs">No community</span>;
  }
  
  const address = community.address1;
  const city = community.city;
  const state = community.state;
  const zip = community.zip;
  
  let fullAddress = '';
  if (address) fullAddress += address;
  if (city) fullAddress += (fullAddress ? ', ' : '') + city;
  if (state) fullAddress += (fullAddress ? ', ' : '') + state;
  if (zip) fullAddress += (fullAddress ? ' ' : '') + zip;
  
  // Generate Google Maps URL
  const googleMapsUrl = fullAddress 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
    : null;
  
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium">{community.description}</span>
      {fullAddress ? (
        <a
          href={googleMapsUrl!}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-yellow-400 dark:hover:text-yellow-300 hover:underline group"
          title={`View ${fullAddress} on Google Maps`}
        >
          <MapPin className="h-3 w-3 flex-shrink-0 group-hover:text-blue-800 dark:group-hover:text-yellow-300" />
          <span className="text-xs truncate max-w-[200px]">{fullAddress}</span>
        </a>
      ) : (
        <span className="text-muted-foreground text-xs">No address</span>
      )}
    </div>
  );
};