import { Config } from '../constants/config';
import { Storage } from '../lib/storage';

export interface SplitwiseImportPreview {
  groupCount: number;
  expenseCount: number;
  memberCount: number;
  warnings: string[];
}

export interface SplitwiseImportResult {
  groupsCreated: number;
  expensesImported: number;
  membersAdded: number;
}

export const importService = {
  previewSplitwise: async (csvUri: string): Promise<SplitwiseImportPreview> => {
    const formData = new FormData();
    formData.append('file', { uri: csvUri, name: 'export.csv', type: 'text/csv' } as unknown as Blob);

    const accessToken = await Storage.getSecure('accessToken');
    const res = await fetch(`${Config.apiBaseUrl}/import/splitwise/preview`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken ?? ''}` },
      body: formData,
    });
    if (!res.ok) throw new Error('Preview failed');
    return res.json() as Promise<SplitwiseImportPreview>;
  },

  confirmSplitwise: async (csvUri: string): Promise<SplitwiseImportResult> => {
    const formData = new FormData();
    formData.append('file', { uri: csvUri, name: 'export.csv', type: 'text/csv' } as unknown as Blob);

    const accessToken = await Storage.getSecure('accessToken');
    const res = await fetch(`${Config.apiBaseUrl}/import/splitwise`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken ?? ''}` },
      body: formData,
    });
    if (!res.ok) throw new Error('Import failed');
    return res.json() as Promise<SplitwiseImportResult>;
  },

  exportCsv: async (): Promise<string> => {
    const accessToken = await Storage.getSecure('accessToken');
    const res = await fetch(`${Config.apiBaseUrl}/export/csv`, {
      headers: { Authorization: `Bearer ${accessToken ?? ''}` },
    });
    if (!res.ok) throw new Error('Export failed');
    return res.text();
  },
};
