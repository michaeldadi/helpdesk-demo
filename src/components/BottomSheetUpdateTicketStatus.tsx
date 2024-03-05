import {FC, useCallback, useEffect, useMemo, useState} from "react";
import BottomSheet, {BottomSheetBackdrop, BottomSheetView} from "@gorhom/bottom-sheet";
import {Text} from "react-native";
import {moderateScale, scale, ScaledSheet} from "react-native-size-matters";
import {BottomSheetProps, TicketStatus} from "../types";
import {Chip} from "react-native-elements";
import {supabase} from "../utils/supabase";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";

const BottomSheetUpdateTicketStatus: FC<BottomSheetProps> = ({sheetRef, ticketId, ticketStatus, onSuccess}) => {
    const snapPoints = useMemo(() => ['30%'], []);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                enableTouchThrough={false}
                pressBehavior={"close"}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                {...props}
            />
        ),
        []
    );

    const [status, setStatus] = useState<TicketStatus | null>(null);

    const statusOptions : {label: string, value: TicketStatus}[] = [
        {label: 'New', value: TicketStatus.NEW},
        {label: 'In Progress', value: TicketStatus.IN_PROGRESS},
        {label: 'Resolved', value: TicketStatus.RESOLVED}
    ];

    const updateTicketStatus = async () => {
        if (status) {
            const {data, error} = await supabase.from('tickets').update({status}).eq('id', ticketId);
            if (error) {
                console.error('Error updating ticket status:', error);
            }

            onSuccess && onSuccess(status);

            console.log('Would normally send email here with body: ...');

            sheetRef.current?.close();
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            )
            Toast.show({ type: 'success', text1: 'Status updated successfully' });
        }
    };

    useEffect(() => {
        updateTicketStatus();
    }, [status]);

    return (
        <BottomSheet ref={sheetRef} snapPoints={snapPoints} enablePanDownToClose index={-1} backdropComponent={renderBackdrop}>
            <BottomSheetView style={styles.container}>
                <Text style={styles.textUpdateStatus}>Update Ticket Status</Text>

                <BottomSheetView style={styles.row}>
                    {/* Status options */}
                    {statusOptions.map((option, index) => (
                        <Chip title={option.label} key={index} type={ticketStatus === option.value ? 'solid' : 'outline'} onPress={() => setStatus(option.value)} />
                    ))}
                </BottomSheetView>
            </BottomSheetView>
        </BottomSheet>
    );
};

const styles = ScaledSheet.create({
    container: {
        padding: scale(12),
        display: 'flex',
    },
    textUpdateStatus: {
        fontSize: moderateScale(20, 0.4),
        fontWeight: 'bold',
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        minWidth: '80%',
        marginTop: scale(22),
        alignSelf: 'flex-start',
        padding: scale(8),
    },
});

export default BottomSheetUpdateTicketStatus;
