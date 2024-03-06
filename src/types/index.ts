import {RefObject} from "react";
import {BottomSheetMethods} from "@gorhom/bottom-sheet/lib/typescript/types";

export type Ticket = {
    id: number;
    name: string;
    email: string;
    description: string;
    status: TicketStatus;
    created_at: string;
    updated_at: string
};

export type FileAttachment = {
    id: number;
    ticket_id: number;
    file_url: string;
    path: string;
    file_size: number;
    type?: string;
    uri: string;
    file_name: string;
    publicUrl: string;
    mime_type: string;
    created_at: string;
    updated_at: string;
}

export type Comment = {
    id: number;
    ticket_id: number;
    author_name: string;
    author_email: string;
    content: string;
    created_at: string;
    updated_at: string;
}

export enum TicketStatus {
    NEW = "NEW",
    IN_PROGRESS = "IN_PROGRESS",
    RESOLVED = "RESOLVED"
}

export type BottomSheetProps = {
    sheetRef: RefObject<BottomSheetMethods>;
    ticketId?: number;
    ticketStatus?: TicketStatus;
    onSuccess?: (val: any) => void;
}

export type FileMeta = {
    file_name: string;
    file_size: number;
    mime_type: string;
    uri: string;
    id: number;
    path: string;
    file_url: string;
}
