import { Coordinates } from '@Pick2Me/shared/interfaces';

export interface SavedLocation {
  name: string;
  coordinates: Coordinates;
  address: string;
}

interface SavedPlace {
  id?: string;
  name: string;
  coordinates: { lat: number; lng: number };
  address: string;
}
