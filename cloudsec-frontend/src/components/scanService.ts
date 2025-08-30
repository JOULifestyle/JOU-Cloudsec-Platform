// scanService.ts
import { useAuth } from '@/contexts/AuthContext';

export const useScanService = () => {
  const { user } = useAuth();
  const token = user?.access_token;

  const scanCSPM = async () => {
    if (!token) throw new Error('User not authenticated');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/scan/cspm`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to perform CSPM scan');
    return res.json();
  };

  const scanCWPP = async () => {
    if (!token) throw new Error('User not authenticated');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/scan/cwpp`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to perform CWPP scan');
    return res.json();
  };

  return { scanCSPM, scanCWPP };
};
