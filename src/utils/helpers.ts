import {supabase} from "./supabase";
import * as FileSystem from 'expo-file-system';
import { decode as atob } from 'base-64';
import {TicketStatus} from "../types";
import * as Sharing from 'expo-sharing';

// Upload a file to storage
export const uploadFile = async (fileUri: string): Promise<any> => {
    const fileName = fileUri.split('/').pop();
    const fileExtension = fileName!.split('.').pop();
    const filePath = `attachments/${Date.now()}.${fileExtension}`;

    // Read the file as a base64 string
    const base64Data = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });

    // Convert base64 to ArrayBuffer
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)).buffer;

    const { data, error } = await supabase.storage
        .from('ticket-attachments')
        .upload(filePath, buffer);

    if (error) {
        throw new Error(`Error uploading file: ${error.message}`);
    }

    const publicUrl = await getPublicFileUrl(data?.path);

    return {...data, publicUrl};
};

// Delete a file from storage
export const deleteFile = async (fileKey: string) => {
    const { data, error } = await supabase.storage
        .from('ticket-attachments')
        .remove([fileKey]);

    if (error) {
        throw new Error('Error deleting file:', error);
    }

    return data;
};

// Get a public URL for a file
const getPublicFileUrl = async (fileKey: string): Promise<string> => {
    const { data } = supabase
        .storage
        .from('ticket-attachments')
        .getPublicUrl(fileKey);

    return data.publicUrl;
}

export const convertBytesToMB = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Convert ticket status to a user-friendly display string
export const convertStatusToDisplayString = (status: TicketStatus): string => {
    switch (status) {
        case TicketStatus.NEW:
            return "New";
        case TicketStatus.IN_PROGRESS:
            return "In Progress";
        case TicketStatus.RESOLVED:
            return "Resolved";
        default:
            return "Unknown";
    }
};

// Download a file from a URL and display share sheet to view file
export const downloadAndShareFile = async (url: string) => {
    // Download the file from the URL
    const { uri: localUri } = await FileSystem.downloadAsync(url, FileSystem.documentDirectory + 'downloadedFile.pdf');

    // Share the downloaded file
    await Sharing.shareAsync(localUri);
};
