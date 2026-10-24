'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  AuthUser,
  RideRequest,
  DriverProfile,
  CommuterProfile,
  Terminal,
  TodaAssociation,
  FarePolicy,
  IncidentReport,
  AdminAuditLog,
  Coordinates,
  RideType,
} from '@/lib/types';
import {
  INITIAL_COMMUTER,
  INITIAL_DRIVERS,
  VERIFIED_TERMINALS,
  TODA_ASSOCIATIONS,
  OFFICIAL_FARE_POLICY,
  DEFAULT_MAP_CENTER,
} from '@/lib/data/antique-data';
import { calculateDistanceKm, calculateFare, generatePinCode } from '@/lib/utils';

interface AppStateContextType {
  // Authentication & Session
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  registerUser: (data: {
    fullName: string;
    phone: string;
    email: string;
    role: Role;
    licenseNumber?: string;
    vehiclePlate?: string;
    bodyNumber?: string;
    todaId?: string;
    franchiseMtop?: string;
  }) => AuthUser;

  // Current role & profiles
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  commuter: CommuterProfile;
  activeDriver: DriverProfile;
  drivers: DriverProfile[];
  terminals: Terminal[];
  todas: TodaAssociation[];
  farePolicy: FarePolicy;
  
  // Active and historical rides
  activeRide: RideRequest | null;
  rideHistory: RideRequest[];
  
  // Safety & Audit
  incidents: IncidentReport[];
  auditLogs: AdminAuditLog[];
  notifications: Array<{ id: string; title: string; message: string; timestamp: string; type?: 'info' | 'success' | 'warning' }>;

  // Commuter Actions
  requestRide: (params: {
    pickupName: string;
    pickupCoords: Coordinates;
    destinationName: string;
    destinationCoords: Coordinates;
    rideType: RideType;
    passengerCount: number;
  }) => { success: boolean; message: string; rideId?: string };
  cancelRide: (rideId: string, reason: string, cancelledBy: 'COMMUTER' | 'DRIVER') => void;
  rateTrip: (rideId: string, rating: number, feedback: string) => void;
  submitCommuterVerification: (docType: 'STUDENT_ID' | 'GOVERNMENT_ID' | 'VOTERS_ID', docUrl: string) => void;

  // Driver Actions
  toggleDriverOnline: () => void;
  acceptRide: (rideId: string) => void;
  driverStartHeading: (rideId: string) => void;
  driverMarkArrived: (rideId: string) => void;
  verifyPinAndStartTrip: (rideId: string, enteredPin: string) => { success: boolean; error?: string };
  completeTrip: (rideId: string) => void;
  updateDriverGps: (coords: Coordinates, accuracy?: number) => void;

  // Admin Actions
  approveDriverVerification: (driverId: string) => void;
  rejectDriverVerification: (driverId: string, reason: string) => void;
  approveCommuterVerification: (commuterId: string) => void;
  rejectCommuterVerification: (commuterId: string, reason: string) => void;
  updateTerminalQueueMode: (terminalId: string, mode: 'PILA' | 'ON_DEMAND') => void;
  updateFarePolicy: (newPolicy: Partial<FarePolicy>) => void;
  resolveIncident: (incidentId: string, notes: string) => void;
  submitIncidentReport: (category: IncidentReport['category'], description: string, rideId?: string) => void;
  clearNotification: (id: string) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentRole, setCurrentRole] = useState<Role>('COMMUTER');
  const [commuter, setCommuter] = useState<CommuterProfile>(INITIAL_COMMUTER);
  const [drivers, setDrivers] = useState<DriverProfile[]>(INITIAL_DRIVERS);
  const [activeDriverId, setActiveDriverId] = useState<string>('drv-1');
  const [terminals, setTerminals] = useState<Terminal[]>(VERIFIED_TERMINALS);
  const [todas] = useState<TodaAssociation[]>(TODA_ASSOCIATIONS);
  const [farePolicy, setFarePolicyState] = useState<FarePolicy>(OFFICIAL_FARE_POLICY);
  
  // Hydrate session from localStorage
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('antiqueride_session');
      if (savedSession) {
        const user = JSON.parse(savedSession) as AuthUser;
        setCurrentUser(user);
        setCurrentRole(user.role);
        if (user.driverId) {
          setActiveDriverId(user.driverId);
        }
      }
    } catch (e) {
      console.warn('Session hydration notice:', e);
    }
  }, []);

  const login = (user: AuthUser) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    if (user.driverId) {
      setActiveDriverId(user.driverId);
    }
    try {
      localStorage.setItem('antiqueride_session', JSON.stringify(user));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    addNotification('Welcome Back', `Logged in as ${user.fullName} (${user.role})`, 'success');
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('antiqueride_session');
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    addNotification('Logged Out', 'You have been signed out safely.', 'info');
  };

  const registerUser = (data: {
    fullName: string;
    phone: string;
    email: string;
    role: Role;
    licenseNumber?: string;
    vehiclePlate?: string;
    bodyNumber?: string;
    todaId?: string;
    franchiseMtop?: string;
  }): AuthUser => {
    const newId = 'user-' + Date.now();
    let authUser: AuthUser;

    if (data.role === 'DRIVER') {
      const newDriverId = 'drv-' + Date.now();
      const toda = todas.find((t) => t.id === data.todaId) || todas[0];
      const newDriverProfile: DriverProfile = {
        id: newDriverId,
        userId: newId,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        licenseNumber: data.licenseNumber || 'F02-24-000123',
        licenseClassification: 'Professional (Code 1, 2)',
        licenseExpiry: '2028-12-31',
        vehiclePlate: data.vehiclePlate || '0000-AQ',
        bodyNumber: data.bodyNumber || 'SJB-999',
        todaId: toda.id,
        todaName: toda.name,
        terminalId: 'term-1',
        terminalName: 'Tradetown Dalipe Terminal',
        franchiseMtopNumber: data.franchiseMtop || 'MTOP-SJB-2024-9999',
        mtopExpiry: '2027-12-31',
        operatingZone: 'San Jose de Buenavista',
        verificationStatus: 'PENDING',
        rating: 5.0,
        totalTrips: 0,
        isOnline: false,
        availability: 'OFFLINE',
        currentCoordinates: { lat: 10.7445, lng: 121.9395 },
        lastGpsUpdate: null,
      };

      setDrivers((prev) => [newDriverProfile, ...prev]);
      setActiveDriverId(newDriverId);

      authUser = {
        id: newId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        role: 'DRIVER',
        driverId: newDriverId,
        bodyNumber: newDriverProfile.bodyNumber,
        todaName: toda.acronym,
      };
    } else {
      const newCommuterProfile: CommuterProfile = {
        id: 'comm-' + Date.now(),
        userId: newId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        isPhoneVerified: true,
        verificationStatus: 'UNVERIFIED',
        discountCategory: 'NONE',
        createdAt: new Date().toISOString(),
      };

      setCommuter(newCommuterProfile);

      authUser = {
        id: newId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        role: 'COMMUTER',
        commuterId: newCommuterProfile.id,
      };
    }

    login(authUser);
    return authUser;
  };
  
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);
  const [rideHistory, setRideHistory] = useState<RideRequest[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([
    {
      id: 'inc-1',
      reporterId: 'user-comm-1',
      reporterName: 'Maria Santos',
      reporterRole: 'COMMUTER',
      reporterPhone: '0918-234-5678',
      category: 'LOST_ITEM',
      driverBodyNumber: 'SJB-042',
      description: 'Left a blue umbrella in the sidecar during trip to Tradetown Dalipe.',
      status: 'RESOLVED',
      actionTakenNotes: 'Driver Nong Joe returned item to Tradetown TODA terminal outpost.',
      createdAt: '2026-02-18T14:30:00Z',
      resolvedAt: '2026-02-18T16:00:00Z',
    },
  ]);

  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([
    {
      id: 'log-1',
      adminId: 'admin-1',
      adminEmail: 'admin@antiqueride.ph',
      action: 'SYSTEM_BOOT',
      targetType: 'SYSTEM',
      targetId: 'SAN_JOSE_NODE_1',
      details: 'AntiqueRide San Jose de Buenavista dispatch engine online. OpenStreetMap active.',
      timestamp: new Date().toISOString(),
    },
  ]);

  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; timestamp: string; type?: 'info' | 'success' | 'warning' }>>([]);

  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const newNotif = {
      id: 'notif-' + Date.now() + Math.random().toString(36).substring(2, 6),
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 15)]);
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const activeDriver = drivers.find((d) => d.id === activeDriverId) || drivers[0];

  // Request Ride (Commuter)
  const requestRide = ({
    pickupName,
    pickupCoords,
    destinationName,
    destinationCoords,
    rideType,
    passengerCount,
  }: {
    pickupName: string;
    pickupCoords: Coordinates;
    destinationName: string;
    destinationCoords: Coordinates;
    rideType: RideType;
    passengerCount: number;
  }) => {
    // Check if user already has an active ride
    if (activeRide && activeRide.status !== 'CANCELLED' && activeRide.status !== 'TRIP_COMPLETED') {
      return { success: false, message: 'You already have an ongoing ride request.' };
    }

    const distanceKm = calculateDistanceKm(pickupCoords, destinationCoords);
    const fareSnapshot = calculateFare(distanceKm, rideType, commuter.discountCategory, farePolicy);
    const pin = generatePinCode();

    const newRequest: RideRequest = {
      id: 'ride-' + Date.now(),
      commuterId: commuter.id,
      commuterName: commuter.fullName,
      commuterPhone: commuter.phone,
      pickupName,
      pickupCoordinates: pickupCoords,
      destinationName,
      destinationCoordinates: destinationCoords,
      rideType,
      estimatedDistanceKm: distanceKm,
      fareAmount: fareSnapshot.totalFare,
      fareSnapshot,
      passengerCount,
      pinCode: pin,
      status: 'REQUESTED',
      requestedAt: new Date().toISOString(),
    };

    setActiveRide(newRequest);
    addNotification('Ride Requested', `Searching for available tricycles in ${pickupName}...`, 'info');

    // Simulate dispatch offer to nearest online verified driver
    const eligibleDriver = drivers.find((d) => d.isOnline && d.availability === 'AVAILABLE' && d.verificationStatus === 'VERIFIED');
    if (eligibleDriver) {
      // Driver gets notified
      addNotification('Driver Alert', `Incoming ride offer from ${commuter.fullName} for Driver ${eligibleDriver.fullName}`, 'info');
    }

    return { success: true, message: 'Ride request broadcasted to authorized drivers.', rideId: newRequest.id };
  };

  // Driver accepts ride
  const acceptRide = (rideId: string) => {
    if (!activeRide || activeRide.id !== rideId) return;

    const assignedDriver = activeDriver;
    const updatedRide: RideRequest = {
      ...activeRide,
      status: 'ACCEPTED',
      driverId: assignedDriver.id,
      driverName: assignedDriver.fullName,
      driverPhone: assignedDriver.phone,
      driverPlate: assignedDriver.vehiclePlate,
      driverBodyNumber: assignedDriver.bodyNumber,
      todaName: assignedDriver.todaName,
      driverCoordinates: assignedDriver.currentCoordinates || assignedDriver.currentCoordinates || DEFAULT_MAP_CENTER,
      acceptedAt: new Date().toISOString(),
    };

    setActiveRide(updatedRide);
    // Update driver state
    setDrivers((prev) =>
      prev.map((d) => (d.id === assignedDriver.id ? { ...d, availability: 'RESERVED' } : d))
    );

    addNotification('Ride Accepted', `Driver ${assignedDriver.fullName} (#${assignedDriver.bodyNumber}) accepted your ride!`, 'success');
  };

  // Driver heading to pickup
  const driverStartHeading = (rideId: string) => {
    if (!activeRide || activeRide.id !== rideId) return;
    setActiveRide((prev) => (prev ? { ...prev, status: 'HEADING_TO_PICKUP' } : null));
    setDrivers((prev) =>
      prev.map((d) => (d.id === activeDriver.id ? { ...d, availability: 'ARRIVING' } : d))
    );
    addNotification('Driver En Route', 'Tricycle is heading to your pickup location.', 'info');
  };

  // Driver arrived at pickup
  const driverMarkArrived = (rideId: string) => {
    if (!activeRide || activeRide.id !== rideId) return;
    setActiveRide((prev) => (prev ? { ...prev, status: 'ARRIVED', arrivedAt: new Date().toISOString() } : null));
    addNotification('Tricycle Arrived', 'Your tricycle has arrived! Please give your 4-digit PIN to the driver.', 'warning');
  };

  // Verify PIN & start trip
  const verifyPinAndStartTrip = (rideId: string, enteredPin: string) => {
    if (!activeRide || activeRide.id !== rideId) {
      return { success: false, error: 'No active ride found.' };
    }
    if (activeRide.pinCode !== enteredPin.trim()) {
      return { success: false, error: 'Invalid PIN. Please check the commuter app for the 4-digit pickup code.' };
    }

    const updatedRide: RideRequest = {
      ...activeRide,
      status: 'TRIP_STARTED',
      startedAt: new Date().toISOString(),
    };
    setActiveRide(updatedRide);
    setDrivers((prev) =>
      prev.map((d) => (d.id === activeDriver.id ? { ...d, availability: 'ON_TRIP' } : d))
    );

    addNotification('Trip Started', 'Passenger verified. Safe travels through Antique!', 'success');
    return { success: true };
  };

  // Complete Trip
  const completeTrip = (rideId: string) => {
    if (!activeRide || activeRide.id !== rideId) return;

    const completedRide: RideRequest = {
      ...activeRide,
      status: 'TRIP_COMPLETED',
      completedAt: new Date().toISOString(),
    };

    setRideHistory((prev) => [completedRide, ...prev]);
    setActiveRide(null);

    // Free up driver and add trip counter
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === activeDriver.id
          ? {
              ...d,
              availability: 'AVAILABLE',
              totalTrips: d.totalTrips + 1,
            }
          : d
      )
    );

    addNotification(
      'Trip Completed',
      `Arrived at destination! Fare: ₱${completedRide.fareAmount.toFixed(2)}. Cash payment to driver.`,
      'success'
    );
  };

  // Cancel Ride
  const cancelRide = (rideId: string, reason: string, cancelledBy: 'COMMUTER' | 'DRIVER') => {
    if (!activeRide || activeRide.id !== rideId) return;

    const cancelledRide: RideRequest = {
      ...activeRide,
      status: 'CANCELLED',
      cancelledAt: new Date().toISOString(),
      cancelledBy,
      cancellationReason: reason,
    };

    setRideHistory((prev) => [cancelledRide, ...prev]);
    setActiveRide(null);

    // Reset assigned driver availability
    if (cancelledRide.driverId) {
      setDrivers((prev) =>
        prev.map((d) => (d.id === cancelledRide.driverId ? { ...d, availability: 'AVAILABLE' } : d))
      );
    }

    addNotification('Ride Cancelled', `Ride was cancelled by ${cancelledBy.toLowerCase()}: ${reason}`, 'warning');
  };

  // Rate trip
  const rateTrip = (rideId: string, rating: number, feedback: string) => {
    setRideHistory((prev) =>
      prev.map((r) =>
        r.id === rideId ? { ...r, passengerRating: rating, passengerFeedback: feedback } : r
      )
    );
    addNotification('Rating Submitted', `Thank you for rating your driver ${rating} stars!`, 'success');
  };

  // Commuter ID upload simulation
  const submitCommuterVerification = (docType: 'STUDENT_ID' | 'GOVERNMENT_ID' | 'VOTERS_ID', docUrl: string) => {
    setCommuter((prev) => ({
      ...prev,
      idDocumentType: docType,
      idDocumentUrl: docUrl,
      verificationStatus: 'PENDING',
    }));
    addNotification('Verification Submitted', 'Identity document uploaded. Super Admin review pending.', 'info');
  };

  // Driver Online toggle
  const toggleDriverOnline = () => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === activeDriver.id) {
          const nextState = !d.isOnline;
          return {
            ...d,
            isOnline: nextState,
            availability: nextState ? 'AVAILABLE' : 'OFFLINE',
            lastGpsUpdate: nextState ? new Date().toISOString() : null,
          };
        }
        return d;
      })
    );
    addNotification('Shift Status', activeDriver.isOnline ? 'You are now OFFLINE' : 'You are now ONLINE and ready for bookings!', 'info');
  };

  // Update Driver GPS
  const updateDriverGps = (coords: Coordinates, accuracy = 4.0) => {
    const timestamp = new Date().toISOString();
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === activeDriver.id
          ? {
              ...d,
              currentCoordinates: coords,
              lastGpsUpdate: timestamp,
              gpsAccuracyMeters: accuracy,
            }
          : d
      )
    );

    // If driver is in active ride, update ride driverCoordinates
    if (activeRide && activeRide.driverId === activeDriver.id) {
      setActiveRide((prev) => (prev ? { ...prev, driverCoordinates: coords } : null));
    }
  };

  // Admin: Approve / Reject Driver
  const approveDriverVerification = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, verificationStatus: 'VERIFIED' } : d))
    );
    const target = drivers.find((d) => d.id === driverId);
    setAuditLogs((prev) => [
      {
        id: 'log-' + Date.now(),
        adminId: 'super-admin',
        adminEmail: 'admin@antiqueride.ph',
        action: 'APPROVE_DRIVER',
        targetType: 'DRIVER',
        targetId: driverId,
        details: `Approved driver ${target?.fullName} (${target?.bodyNumber}). Franchise and License verified.`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
    addNotification('Driver Approved', `Driver ${target?.fullName} is now verified to take bookings.`, 'success');
  };

  const rejectDriverVerification = (driverId: string, reason: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, verificationStatus: 'REJECTED' } : d))
    );
    const target = drivers.find((d) => d.id === driverId);
    setAuditLogs((prev) => [
      {
        id: 'log-' + Date.now(),
        adminId: 'super-admin',
        adminEmail: 'admin@antiqueride.ph',
        action: 'REJECT_DRIVER',
        targetType: 'DRIVER',
        targetId: driverId,
        details: `Rejected driver ${target?.fullName}: ${reason}`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
    addNotification('Driver Application Rejected', `Driver ${target?.fullName} status updated to REJECTED.`, 'warning');
  };

  // Admin: Approve / Reject Commuter
  const approveCommuterVerification = (commuterId: string) => {
    setCommuter((prev) => ({ ...prev, verificationStatus: 'VERIFIED' }));
    setAuditLogs((prev) => [
      {
        id: 'log-' + Date.now(),
        adminId: 'super-admin',
        adminEmail: 'admin@antiqueride.ph',
        action: 'APPROVE_COMMUTER',
        targetType: 'COMMUTER',
        targetId: commuterId,
        details: `Approved student/government ID verification for commuter ${commuter.fullName}. 20% discount authorized.`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
    addNotification('Commuter Verified', 'Commuter identity document verified under DPA guidelines.', 'success');
  };

  const rejectCommuterVerification = (commuterId: string, reason: string) => {
    setCommuter((prev) => ({ ...prev, verificationStatus: 'REJECTED' }));
    setAuditLogs((prev) => [
      {
        id: 'log-' + Date.now(),
        adminId: 'super-admin',
        adminEmail: 'admin@antiqueride.ph',
        action: 'REJECT_COMMUTER',
        targetType: 'COMMUTER',
        targetId: commuterId,
        details: `Rejected commuter verification: ${reason}`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
    addNotification('Verification Rejected', `Document rejection logged: ${reason}`, 'warning');
  };

  // Admin: Update Terminal queue mode
  const updateTerminalQueueMode = (terminalId: string, mode: 'PILA' | 'ON_DEMAND') => {
    setTerminals((prev) =>
      prev.map((t) => (t.id === terminalId ? { ...t, queueMode: mode } : t))
    );
    setAuditLogs((prev) => [
      {
        id: 'log-' + Date.now(),
        adminId: 'super-admin',
        adminEmail: 'admin@antiqueride.ph',
        action: 'UPDATE_TERMINAL_QUEUE_MODE',
        targetType: 'TERMINAL',
        targetId: terminalId,
        details: `Changed queue mode for terminal ${terminalId} to ${mode}`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  // Admin: Update Fare policy
  const updateFarePolicy = (newPolicy: Partial<FarePolicy>) => {
    setFarePolicyState((prev) => ({ ...prev, ...newPolicy }));
    setAuditLogs((prev) => [
      {
        id: 'log-' + Date.now(),
        adminId: 'super-admin',
        adminEmail: 'admin@antiqueride.ph',
        action: 'UPDATE_FARE_POLICY',
        targetType: 'FARE_POLICY',
        targetId: farePolicy.id,
        details: `Updated fare policy parameters. Ordinance Ref: ${newPolicy.sourceOrdinance || farePolicy.sourceOrdinance}`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
    addNotification('Fare Matrix Updated', 'Municipal fare policy successfully updated.', 'info');
  };

  // Admin: Resolve Incident
  const resolveIncident = (incidentId: string, notes: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              status: 'RESOLVED',
              actionTakenNotes: notes,
              resolvedAt: new Date().toISOString(),
            }
          : inc
      )
    );
    setAuditLogs((prev) => [
      {
        id: 'log-' + Date.now(),
        adminId: 'super-admin',
        adminEmail: 'admin@antiqueride.ph',
        action: 'RESOLVE_INCIDENT',
        targetType: 'INCIDENT',
        targetId: incidentId,
        details: `Incident resolved: ${notes}`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
    addNotification('Incident Resolved', `Incident #${incidentId} marked as resolved.`, 'success');
  };

  // Submit Incident Report
  const submitIncidentReport = (
    category: IncidentReport['category'],
    description: string,
    rideId?: string
  ) => {
    const newInc: IncidentReport = {
      id: 'inc-' + Date.now(),
      reporterId: currentRole === 'COMMUTER' ? commuter.id : activeDriver.id,
      reporterName: currentRole === 'COMMUTER' ? commuter.fullName : activeDriver.fullName,
      reporterRole: currentRole,
      reporterPhone: currentRole === 'COMMUTER' ? commuter.phone : activeDriver.phone,
      rideId,
      driverBodyNumber: currentRole === 'COMMUTER' ? activeRide?.driverBodyNumber : activeDriver.bodyNumber,
      category,
      description,
      status: 'PENDING_REVIEW',
      createdAt: new Date().toISOString(),
    };

    setIncidents((prev) => [newInc, ...prev]);
    addNotification(
      'Report Received',
      'Your report has been submitted to the AntiqueRide Safety & Transport Board desk.',
      'info'
    );
  };

  return (
    <AppStateContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        registerUser,
        currentRole,
        setCurrentRole,
        commuter,
        activeDriver,
        drivers,
        terminals,
        todas,
        farePolicy,
        activeRide,
        rideHistory,
        incidents,
        auditLogs,
        notifications,
        requestRide,
        cancelRide,
        rateTrip,
        submitCommuterVerification,
        toggleDriverOnline,
        acceptRide,
        driverStartHeading,
        driverMarkArrived,
        verifyPinAndStartTrip,
        completeTrip,
        updateDriverGps,
        approveDriverVerification,
        rejectDriverVerification,
        approveCommuterVerification,
        rejectCommuterVerification,
        updateTerminalQueueMode,
        updateFarePolicy,
        resolveIncident,
        submitIncidentReport,
        clearNotification,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
