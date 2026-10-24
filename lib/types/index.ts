export type Role = 'COMMUTER' | 'DRIVER' | 'SUPER_ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  legalName?: string;
  role: Role;
  avatarUrl?: string;
  driverId?: string;
  commuterId?: string;
  bodyNumber?: string;
  todaName?: string;
}

export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export type DriverAvailability = 
  | 'AVAILABLE' 
  | 'RESERVED' 
  | 'ARRIVING' 
  | 'ON_TRIP' 
  | 'OFFLINE' 
  | 'GPS_UNAVAILABLE' 
  | 'STALE_LOCATION';

export type RideType = 'REGULAR' | 'SPECIAL';

export type RideStatus = 
  | 'REQUESTED' 
  | 'ACCEPTED' 
  | 'HEADING_TO_PICKUP' 
  | 'ARRIVED' 
  | 'PASSENGER_VERIFIED' 
  | 'TRIP_STARTED' 
  | 'TRIP_COMPLETED' 
  | 'CANCELLED';

export type QueueDispatchMode = 'PILA' | 'ON_DEMAND';

export type VehicleCategory = 'TRICYCLE' | 'JEEPNEY' | 'VAN' | 'BUS';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TodaAssociation {
  id: string;
  name: string;
  acronym: string;
  municipality: string;
  barangay: string;
  accreditationNumber: string;
  contactPerson: string;
  contactPhone: string;
  activeUnits: number;
  verifiedStatus: boolean;
}

export interface Terminal {
  id: string;
  name: string;
  todaId: string;
  todaName: string;
  municipality: string;
  barangay: string;
  coordinates: Coordinates;
  verificationSource: string;
  supportedVehicleType: VehicleCategory;
  status: 'ACTIVE' | 'TEMPORARY_SUSPENDED' | 'FIELD_VERIFICATION_PENDING';
  capacity: number;
  currentQueueCount: number;
  queueMode: QueueDispatchMode;
  dateConfirmed: string;
}

export interface FarePolicy {
  id: string;
  municipality: string;
  operatingZone: string;
  sourceOrdinance: string;
  ordinanceTitle: string;
  approvalReference: string;
  verificationDate: string;
  validFrom: string;
  validUntil: string;
  approvedByAdmin: string;
  baseFareRegular: number; // e.g., 15.00 PHP first 2 km
  baseKmRegular: number;
  succeedingPerKmRegular: number; // e.g., 2.50 PHP / km
  specialTripBaseFare: number; // e.g., 40.00 - 50.00 PHP negotiated or official charter
  studentDiscountPct: number; // 20%
  seniorPwdDiscountPct: number; // 20%
  notes: string;
}

export interface CommuterProfile {
  id: string;
  userId: string;
  fullName: string;
  legalName?: string;
  avatarUrl?: string;
  email: string;
  phone: string;
  isPhoneVerified: boolean;
  verificationStatus: VerificationStatus;
  idDocumentType?: 'STUDENT_ID' | 'GOVERNMENT_ID' | 'VOTERS_ID' | 'PHILSYS_ID' | 'SENIOR_ID' | 'PWD_ID' | 'DRIVERS_LICENSE';
  idDocumentUrl?: string;
  discountCategory: 'NONE' | 'STUDENT' | 'SENIOR' | 'PWD';
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createdAt: string;
}

export interface DriverProfile {
  id: string;
  userId: string;
  fullName: string;
  legalName?: string;
  avatarUrl?: string;
  phone: string;
  email: string;
  governmentIdType?: string;
  governmentIdUrl?: string;
  licenseNumber: string;
  licenseClassification: string;
  licenseExpiry: string;
  vehiclePlate: string;
  bodyNumber: string; // Official municipal tricycle body number
  todaId: string;
  todaName: string;
  terminalId: string;
  terminalName: string;
  franchiseMtopNumber: string; // Municipal Tricycle Operator's Permit
  mtopExpiry: string;
  operatingZone: string;
  verificationStatus: VerificationStatus;
  licenseDocumentUrl?: string;
  orCrDocumentUrl?: string;
  mtopDocumentUrl?: string;
  rating: number;
  totalTrips: number;
  isOnline: boolean;
  availability: DriverAvailability;
  currentCoordinates: Coordinates | null;
  lastGpsUpdate: string | null;
  gpsAccuracyMeters?: number;
  batteryLevel?: number;
  queuePosition?: number;
}

export interface TripFareSnapshot {
  baseFare: number;
  distanceKm: number;
  distanceCharge: number;
  discountPct: number;
  discountAmount: number;
  totalFare: number;
  isNegotiatedSpecial: boolean;
  currency: string;
  farePolicyRef: string;
}

export interface RideRequest {
  id: string;
  commuterId: string;
  commuterName: string;
  commuterPhone: string;
  pickupName: string;
  pickupCoordinates: Coordinates;
  destinationName: string;
  destinationCoordinates: Coordinates;
  rideType: RideType;
  estimatedDistanceKm: number;
  fareAmount: number;
  fareSnapshot: TripFareSnapshot;
  passengerCount: number;
  pinCode: string; // 4-digit verification PIN commuter shows driver before boarding
  status: RideStatus;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverPlate?: string;
  driverBodyNumber?: string;
  todaName?: string;
  driverCoordinates?: Coordinates;
  requestedAt: string;
  acceptedAt?: string;
  arrivedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: 'COMMUTER' | 'DRIVER' | 'SYSTEM';
  cancellationReason?: string;
  passengerRating?: number;
  passengerFeedback?: string;
}

export interface IncidentReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterRole: Role;
  reporterPhone: string;
  rideId?: string;
  driverBodyNumber?: string;
  category: 'SAFETY_CONCERN' | 'OVERCHARGING' | 'LOST_ITEM' | 'DRIVER_MISBEHAVIOR' | 'PRANK_OR_NO_SHOW' | 'VEHICLE_CONDITION';
  description: string;
  status: 'PENDING_REVIEW' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  actionTakenNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: 'DRIVER' | 'COMMUTER' | 'FARE_POLICY' | 'TERMINAL' | 'INCIDENT' | 'SYSTEM';
  targetId: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}
