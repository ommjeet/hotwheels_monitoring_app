export interface SystemParameters {
  scanIntervalSeconds: number;
  userLocation: string;
  autoCheckoutSimulated: boolean;
  autoCheckoutPaymentMethod: string;
  localChromePort: number;
  rememberSession: boolean;
  headlessMode: boolean;
  toastAlertsEnabled: boolean;
  storageCleanTriggerCount: number;
  enableJitter: boolean;
  jitterRangeSeconds: number;
  emulateMouseMovement: boolean;
  rotateUserAgent: boolean;
  coolDownAfterScans: number;
  coolDownDurationMinutes: number;
  updatedAt?: string;
}

export const DEFAULT_SYSTEM_PARAMETERS: SystemParameters = {
  scanIntervalSeconds: 4,
  userLocation: 'Mumbai Central Area, Sector 4',
  autoCheckoutSimulated: true,
  autoCheckoutPaymentMethod: 'COD',
  localChromePort: 9222,
  rememberSession: true,
  headlessMode: false,
  toastAlertsEnabled: true,
  storageCleanTriggerCount: 100,
  enableJitter: true,
  jitterRangeSeconds: 2,
  emulateMouseMovement: true,
  rotateUserAgent: true,
  coolDownAfterScans: 40,
  coolDownDurationMinutes: 2,
  updatedAt: new Date().toISOString()
};
