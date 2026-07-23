import { SystemParameters } from '../../server/config/defaults';

export async function fetchSystemParameters(): Promise<SystemParameters> {
  const response = await fetch('/api/system-parameters');
  if (!response.ok) {
    throw new Error(`Failed to fetch system parameters: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function saveSystemParameters(params: Partial<SystemParameters>): Promise<SystemParameters> {
  const response = await fetch('/api/system-parameters', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.error || `Failed to save system parameters: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function resetSystemParameters(): Promise<SystemParameters> {
  const response = await fetch('/api/system-parameters/reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to reset system parameters: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}
