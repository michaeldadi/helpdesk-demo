import {FC, useEffect, useLayoutEffect, useRef, useState} from "react";
import {ScrollView, Text, TouchableOpacity, View} from "react-native";
import {moderateScale, scale, ScaledSheet} from "react-native-size-matters";
import {Comment, FileAttachment, Ticket, TicketStatus} from "../../../types";
import {supabase} from "../../../utils/supabase";
import {useLocalSearchParams, useNavigation} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {Chip} from "react-native-elements";
import {convertStatusToDisplayString} from "../../../utils/helpers";
import BottomSheet from "@gorhom/bottom-sheet";
import BottomSheetAddComment from "../../../components/BottomSheetAddComment";
import BottomSheetUpdateTicketStatus from "../../../components/BottomSheetUpdateTicketStatus";
import CommentListItem from "../../../components/CommentListItem";
import FileAttachmentListItem from "../../../components/FileAttachmentListItem";

const AdminTicketDetails: FC = () => {
    const {id} = useLocalSearchParams();

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [comments, setComments] = useState<Comment[] | null>([]);
    const [attachments, setAttachments] = useState<FileAttachment[] | null>([]);

    const navigation = useNavigation();

    const bottomSheetRefAddComment = useRef<BottomSheet>(null);
    const bottomSheetRefUpdateStatus = useRef<BottomSheet>(null);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={styles.navigationHeaderContainer}>
                    <TouchableOpacity style={styles.navigationIconContainer} onPress={() => bottomSheetRefAddComment.current?.expand()}>
                        <Ionicons name={'chatbubble-outline'} size={scale(18)} color={'#6cacf4'} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navigationIconContainer} onPress={() => bottomSheetRefUpdateStatus.current?.expand()}>
                        <Ionicons name={'flash-outline'} size={scale(18)} color={'#6cacf4'} />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, []);

    const fetchTicketDetails = async () => {
        const { data, error } = await supabase
            .from('tickets')
            .select()
            .eq('id', id)
            .single();

        setTicket(data)
    }

    useEffect(() => {
        fetchTicketDetails();
    }, []);

    const fetchComments = async () => {
        if (!ticket?.id) return;

        const { data, error } = await supabase
            .from('comments')
            .select()
            .eq('ticket_id', ticket.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching comments:', error);
        } else {
            setComments(data);
        }
    };

    const fetchAttachments = async () => {
        if (!ticket?.id) return;

        const { data, error } = await supabase
            .from('attachments')
            .select()
            .eq('ticket_id', ticket.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching attachments:', error);
        } else {
            setAttachments(data);
        }
    };

    useEffect(() => {
        Promise.all([fetchComments(), fetchAttachments()]);
    }, [ticket]);

    return (
        <>
            <View style={{flex: 1}}>
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.titleText}>Ticket Details</Text>

                    <Text>Overview</Text>

                    <Text style={styles.subheaderText}>Customer Information</Text>
                    <View style={styles.row}>
                        <View style={styles.profileImageContainer}>
                            <Ionicons name={'person'} size={scale(30)} color={'#6cacf4'} />
                        </View>
                        <View>
                            <Text style={styles.textCustomerName}>{ticket?.name}</Text>
                            <Text>{ticket?.email}</Text>
                        </View>
                    </View>

                    <Text style={styles.subheaderText}>Ticket Information</Text>
                    <View style={styles.row}>
                        <Text style={styles.ticketNumberText}>{`Ticket #${ticket?.id}`}</Text>
                        <Chip title={convertStatusToDisplayString(ticket?.status as TicketStatus)} />
                    </View>

                    {attachments?.map(attachment => (
                        <FileAttachmentListItem file={attachment} />
                    ))}

                    <Text style={styles.subheaderText}>Ticket Description</Text>
                    <Text>{ticket?.description}</Text>

                    <Text style={styles.subheaderText}>Correspondence</Text>
                    {comments?.map((comment) => (
                        <CommentListItem comment={comment} />
                    ))}
                </ScrollView>
            </View>

            <BottomSheetAddComment sheetRef={bottomSheetRefAddComment} ticketId={ticket?.id} onSuccess={val => setComments([val, ...[comments]])} />
            <BottomSheetUpdateTicketStatus sheetRef={bottomSheetRefUpdateStatus} ticketId={ticket?.id} ticketStatus={ticket?.status} onSuccess={val => setTicket({...ticket!, status: val})} />
        </>
    );
};

const styles = ScaledSheet.create({
    container: {
        flexGrow: 1,
        padding: scale(16),
    },
    titleText: {
        fontSize: moderateScale(24, 0.4),
        fontWeight: 'bold',
        marginBottom: scale(12),
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        padding: scale(12),
        marginVertical: scale(14),
        alignItems: 'center',
    },
    navigationHeaderContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: scale(75),
    },
    navigationIconContainer: {
        padding: scale(10),
    },
    profileImageContainer: {
        borderRadius: scale(12),
        backgroundColor: '#aab4bc',
        padding: scale(10),
        marginRight: scale(8),
    },
    textCustomerName: {
        fontSize: moderateScale(24, 0.4),
        fontWeight: 'bold',
    },
    subheaderText: {
        fontSize: moderateScale(18, 0.4),
        marginTop: scale(10),
    },
    ticketNumberText: {
        color: '#5b7fa7',
        fontWeight: 'bold',
        marginRight: scale(10),
    },
});

export default AdminTicketDetails;
