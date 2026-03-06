// lib/sheets.ts

interface LeadData {
    name: string;
    business: string;
    email: string;
    phone?: string;
    teamSize: string;
    vertical: string;
}

/**
 * Submits lead data to Google Sheets via a backend endpoint or direct API call.
 * For now, this is a robust mock that simulates a real network request.
 * 
 * TODO: Replace with real Google Sheets API or a webhook (e.g. Zapier, Make).
 */
export async function submitLead(data: LeadData): Promise<boolean> {
    console.log('[Sheets Service] Submitting lead:', data);

    try {
        // Simulate network latency
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // In a real implementation, you would do something like:
        /*
        const response = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.ok;
        */

        // Success simulation
        return true;
    } catch (error) {
        console.error('[Sheets Service] Error submitting lead:', error);
        throw error;
    }
}
